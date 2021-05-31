/* eslint-disable no-unsafe-finally */
import { NetworkInfo } from 'react-native-network-info';
import sip from 'shift8-ip-func';
import ipaddr from 'ipaddr.js';
import NetInfo from '@react-native-community/netinfo';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import wifi from 'react-native-android-wifi';
import perf from '@react-native-firebase/perf';
import IP from 'react-native-ip-android';
import ApiClient from '@logocomune/maclookup';
import { deviceDiscovered } from '../redux/actions/discovery';

const apiClient = new ApiClient('01f54jg4zgg405b30xw2sbcy4201f54jhfh7yzzjsztx6c351j7nmrwe0t8ur1mk');
apiClient.withLRUCache();

const baseUrl = 'https://v2-1-0-dot-watutors-1.uc.r.appspot.com/v2/';
// const baseUrl = 'http://192.168.4.26:3001/v2/';

axios.interceptors.request.use(async (config) => {
  try {
    const httpMetric = perf().newHttpMetric(config.url, config.method.toUpperCase());
    // eslint-disable-next-line no-param-reassign
    config.metadata = { httpMetric };

    await httpMetric.start();
  } catch (error) {
    console.log(error);
  } finally {
    return config;
  }
});

axios.interceptors.response.use(
  async (response) => {
    try {
      const { httpMetric } = response.config.metadata;

      httpMetric.setHttpResponseCode(response.status);
      httpMetric.setResponseContentType(response.headers['content-type']);

      await httpMetric.stop();
    } finally {
      return response;
    }
  },
  async (error) => {
    try {
      const { httpMetric } = error.config.metadata;

      httpMetric.setHttpResponseCode(error.response.status);
      httpMetric.setResponseContentType(error.response.headers['content-type']);
      await httpMetric.stop();
    } finally {
      return Promise.reject(error);
    }
  },
);

export const apiFetch = async ({ method, endpoint, body = {} }) => {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await auth().currentUser.getIdToken()}`,
    },
    url: `${baseUrl}${endpoint.replace('+', '%2B')}`,
  };

  if (method !== 'GET') config.data = JSON.stringify(body);

  console.log(`API ${method} initiated: ${baseUrl}${endpoint}: ${JSON.stringify(config, null, 2)}`);

  return axios(config);
};

/**
 * Fetches MAC vendor information.
 *
 * @link https://maclookup.app/api-v2/documentation
 *
 * @param {string} mac Target MAC address.
 *
 * @returns {string} MAC vendor, if found, else empty result.
 */
const fetchMacVendor = (mac) => new Promise((resolve) => {
  apiClient.getMacInfo(
    mac,
    ({ macInfo }) => {
      if (macInfo.found && macInfo.company) {
        resolve(macInfo.company);
      } else {
        resolve('');
      }
    },
    (error) => {
      console.log('[fetch mac vendor] error', mac, error);

      resolve('');
    },
  );
});

/**
 * Converts IPv6 link-local address to MAC address.
 *
 * Splits IPv6 address apart based on colons and removes all but last 4 sections. Loops through
 * each string section and prepends 0's until it reaches a length of 4, since 0's are typically
 * ommitted. Pushes first byte of characters to new array, then pushes the second byte. After
 * iterating through each initial 4 sections of IPv6 address, parses the first byte of the MAC
 * address into hex and applies the bitwise XOR operator on it, then converts it to a string with
 * hex base once more. Prepends a 0 if necessary. Removes the 4th and then the 3rd byte and
 * returns the calculated MAC address. This only works with link-local IPv6 addresses and often
 * calculates the wrong MAC address with newer devices.
 *
 * @link https://stackoverflow.com/questions/37140846/how-to-convert-ipv6-link-local-address-to-mac-address-in-python
 *
 * @param {string} ipv6 IPv6 address.
 *
 * @returns {string} Calculated MAC address.
 */

export const ipv62mac = (ipv6) => {
  const ipv6Parts = ipv6.split(':').slice(-4);
  const macParts = [];

  for (let i = 0; i < ipv6Parts.length; i += 1) {
    let ipv6Part = ipv6Parts[i];

    while (ipv6Part.length < 4) {
      ipv6Part = `0${ipv6Part}`;
    }

    macParts.push(ipv6Part.slice(0, 2));
    macParts.push(ipv6Part.slice(-2));
  }

  // eslint-disable-next-line no-bitwise
  macParts[0] = (parseInt(macParts[0], 16) ^ 2).toString(16);

  if (macParts[0].length === 1) {
    macParts[0] = `0${macParts[0]}`;
  }

  macParts.splice(4, 1);

  macParts.splice(3, 1);

  return macParts.join(':');
};

const getIpRange = (subnet, localIp) => {
  const subconv = ipaddr.IPv4.parse(subnet).prefixLengthFromSubnetMask();
  console.log('SUBCONV', subconv);
  const firstHost = ipaddr.IPv4.networkAddressFromCIDR(`${localIp}/${subconv}`);
  console.log('FIRSTHOST', firstHost);
  const lastHost = ipaddr.IPv4.broadcastAddressFromCIDR(`${localIp}/${subconv}`);
  console.log('LASTHOST', lastHost);

  const firstHostHex = sip.convertIPtoHex(firstHost);
  const lastHostHex = sip.convertIPtoHex(lastHost);
  const ipRange = sip.getIPRange(firstHostHex, lastHostHex);

  return {
    subconv,
    firstHost: firstHost.octets?.join('.') ?? [],
    lastHost: lastHost.octets?.join('.') ?? [],
    firstHostHex,
    lastHostHex,
    ipRange: ipRange.length ? ipRange.slice(1) : ipRange,
  };
};

/**
 * For fetching network information
 * @returns {Object} of network Info
 */
export const networkPromise = async (values) => {
  try {
    const netInfo = await NetInfo.fetch(); // seems to fetch incorrect subnet on some networks
    console.log('NET_INFO', netInfo);
    const localIp = values?.localIp || netInfo.details.ipAddress;
    console.log('IP', localIp);
    let localNetmask = values?.localNetmask || await NetworkInfo.getSubnet(); // same here though
    console.log('NETMASK', localNetmask);

    let {
      subconv, firstHost, lastHost, firstHostHex, lastHostHex, ipRange,
    } = getIpRange(localNetmask, localIp);

    if (ipRange.length < 254) {
      localNetmask = netInfo.details.subnet;
      console.log('SUBNET', localNetmask);

      ({
        subconv, firstHost, lastHost, firstHostHex, lastHostHex, ipRange,
      } = getIpRange(localNetmask, localIp));
    }

    return {
      localIp,
      localNetmask,
      subconv,
      firstHost,
      lastHost,
      firstHostHex,
      lastHostHex,
      ipRange,
    };
  } catch (error) {
    console.log('[network details] ERROR', error);

    return null;
  }
};

export const scanBSSIDs = () => new Promise((resolve, reject) => {
  wifi.loadWifiList(
    (wifiStringList) => {
      resolve(JSON.parse(wifiStringList).map(({ BSSID }) => BSSID));
    },
    (error) => {
      console.log('[scan BSSIDs] ERROR', error);
      reject(error);
    },
  );
});

export const getMacAddresses = async (discovered, dispatch) => {
  const macAddresses = await IP.getNeighbors();

  const devices = await Promise.all(discovered.map(async (device) => {
    if (macAddresses[device.ip]?.mac) {
      const { mac } = macAddresses[device.ip];

      return fetchMacVendor(mac)
        .then((manufacturer) => {
          const newDevice = { ...device, mac };

          if (newDevice.possibleMac) {
            delete newDevice.possibleMac;
          }

          if (manufacturer) newDevice.manufacturer = manufacturer;

          console.log(device.ip, mac, manufacturer);

          return newDevice;
        });
    }

    let manufacturer = '';

    if (device.mac) {
      await fetchMacVendor(device.mac)
        .then((result) => {
          manufacturer = result;
        });
    } else if (device.possibleMac) {
      await fetchMacVendor(device.possibleMac)
        .then((result) => {
          manufacturer = result;
        });
    }

    const newDevice = { ...device };

    if (manufacturer) newDevice.manufacturer = manufacturer;

    return newDevice;
  }));

  devices.forEach((device) => {
    dispatch(deviceDiscovered(device));
  });
};

import { NetworkInfo } from 'react-native-network-info';
import sip from 'shift8-ip-func';
import ipaddr from 'ipaddr.js';
import NetInfo from '@react-native-community/netinfo';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import wifi from 'react-native-android-wifi';
import Ping from 'react-native-ping';
import publicIP from 'react-native-public-ip';

import { zeroConfScan, zservicesScan } from './zeroconf';
import detectUPnPDevices from './upnp';
import { scanIpRange } from './portScanner';

const successCodes = [200, 201, 202, 204, 303];
// const baseUrl = 'https://v2-0-39-dot-watutors-1.uc.r.appspot.com/v2/';
const baseUrl = 'http://192.168.4.26:3001/v2/';

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

  const time = Date.now();

  console.log(`API ${method} initiated: ${baseUrl}${endpoint}: ${JSON.stringify(config, null, 2)}`);

  return axios(config);
};

const parseResponse = async (response, endpoint, time) => {
  console.log('RAW RESPONSE', response);

  const { status, headers } = response;

  console.log(`${new Date().getTime() - time}ms ${endpoint} HTML response code: ${status}`);

  if (!successCodes.includes(status)) {
    throw new Error(`${status} - ${await response.text()}`);
  }

  const content = headers.get('content-type');
  if (content.includes('json')) {
    return response.json()
      .then((data) => {
        console.log(`Response content JSON: ${JSON.stringify(data, null, 2)}`);
        return data;
      });
  }

  return response.text()
    .then((data) => {
      console.log(`Response content not JSON, instead ${content}: ${data}`);
      return data;
    });
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
export const fetchMacVendor = (mac) => fetch(`https://api.maclookup.app/v2/macs/${mac}`)
  .then((response) => response.json())
  .then(({ found, company }) => {
    if (found) return company;

    return '';
  })
  .catch((error) => {
    console.log('[zeroconf] ERROR', error);
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

/**
 * For fetching network information
 * @returns {Object} of network Info
 */
export const networkPromise = async (values) => {
  try {
    const netInfo = await NetInfo.fetch(); // seems to fetch incorrect subnet
    console.log('NET_INFO', netInfo);
    const localIp = values?.localIp || netInfo.details.ipAddress;
    console.log('IP', localIp);
    const localNetmask = values?.localNetmask || await NetworkInfo.getSubnet();
    console.log('NETMASK', localNetmask);
    const subconv = ipaddr.IPv4.parse(localNetmask).prefixLengthFromSubnetMask();
    console.log('SUBCONV', subconv);
    const firstHost = ipaddr.IPv4.networkAddressFromCIDR(`${localIp}/${subconv}`);
    console.log('FIRSTHOST', firstHost);
    const lastHost = ipaddr.IPv4.broadcastAddressFromCIDR(`${localIp}/${subconv}`);
    console.log('LASTHOST', lastHost);
    const firstHostHex = sip.convertIPtoHex(firstHost);
    console.log('FIRSTHEX', firstHostHex);
    const lastHostHex = sip.convertIPtoHex(lastHost);
    console.log('LASTHEX', lastHostHex);
    const ipRange = sip.getIPRange(firstHostHex, lastHostHex);
    const newIpRange = ipRange.length ? ipRange.slice(1) : ipRange;

    return {
      localIp,
      localNetmask,
      subconv,
      firstHost,
      lastHost,
      firstHostHex,
      lastHostHex,
      ipRange: newIpRange,
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

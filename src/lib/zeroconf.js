import Zeroconf from 'react-native-zeroconf';
import { fetchMacVendor, ipv62mac } from './helpers';
import { store } from '../redux/store';
import {
  deviceDiscovered, setStartDiscoveryTime, setEndDiscoveryTime,
} from '../redux/actions/discovery';

const zeroconf = new Zeroconf();

/**
 * Scans for Zeroconf devices.
 *
 * Iterates through specified list of protocols and scans each for 2.5 seconds, since only one
 * Zeroconf scan can be executed at once.
 *
 * @link https://github.com/balthazar/react-native-zeroconf
 */
export const zeroconfScan = async (dispatch, config, isHeadless) => {
  const discovered = [];

  zeroconf.on('resolved', async (service) => {
    const ip = service?.addresses[0];

    // confirm it's an IPv4 address
    if (ip.length <= 15) {
      console.log('[zeroconf] RESOLVED', ip);

      const ipv6 = service?.addresses.find((addr) => addr.includes('fe80::'));

      if (ipv6) console.log('[zeroconf] link-local ipv6', ipv6);

      const mac = service?.txt?.mac || service?.txt?.mac_address;
      const possibleMac = ipv6 ? ipv62mac(ipv6) : '';

      console.log('[zeroconf] mac', mac);
      console.log('[zeroconf] possible mac', possibleMac);

      let manufacturer = '';

      if (!service?.txt?.usb_MFG && !service?.txt?.vendor && (mac || possibleMac)) {
        console.log('[zeroconf] fetching mac vendor');

        if (mac) {
          manufacturer = await fetchMacVendor(mac);
        } else {
          manufacturer = await fetchMacVendor(possibleMac);
        }

        if (!manufacturer && mac && possibleMac) {
          manufacturer = await fetchMacVendor(possibleMac);
        }
      } else {
        manufacturer = service?.txt?.usb_MFG || service?.txt?.vendor;
      }

      const result = {
        ip,
        protocol: ['zeroconf'],
        timestamp: [Date.now()],
        txt: service.txt,
        manufacturer,
      };

      if (service.name) result.name = service.name;
      if (service?.txt?.md) result.model = service.txt.md;
      if (mac) result.mac = mac;
      if (possibleMac) result.possibleMac = possibleMac;

      discovered.push(result);

      if (!isHeadless) dispatch(deviceDiscovered(result));
    }
  });

  const scanDevices = async () => {
    if (!isHeadless) dispatch(setStartDiscoveryTime('zeroconf'));

    const start = Date.now();

    console.log('ZSERVICES TO SCAN', config.services);

    for (let i = 0; i < config?.services?.length; i += 1) {
      // check if task cancelled
      if (!isHeadless && !store.getState()?.discovery?.isScanning) { // check if canceled
        return;
      }

      console.log('[zeroconf] scanning', config.services[i]);

      zeroconf.scan(config?.services[i], 'tcp', ''); // empty domain selects default

      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 2000));

      zeroconf.stop();
    }

    zeroconf.removeAllListeners();

    if (isHeadless) {
      return { discovered, start, end: Date.now() };
    }

    dispatch(setEndDiscoveryTime('zeroconf'));
  };

  try {
    if (isHeadless) {
      return scanDevices();
    }

    await scanDevices();
  } catch (error) {
    console.log('[zeroconf] ERROR', error.message);
  }
};

export const zservicesScan = async (isHeadless) => {
  const servicesFound = [];

  zeroconf.on('found', async (service) => {
    // scannable services do not contain addresses, only discovered devices do
    if (!service.addresses) {
      console.log(
        '[zeroconf] found available service for scanning', `${service}._tcp.local.`,
      );
      servicesFound.push(service.slice(1));
    }
  });

  try {
    zeroconf.scan('services', 'dns-sd._udp', 'local');

    if (isHeadless) {
      const waitTill = new Date(Date.now() + 500);

      while (waitTill > new Date()) {
        // do nothing
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    zeroconf.stop();
    zeroconf.removeAllListeners();

    return servicesFound;
  } catch (error) {
    console.log('[zservices] ERROR', error.message);

    return [];
  }
};

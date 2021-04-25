import Zeroconf from 'react-native-zeroconf';
import { fetchMacVendor, ipv62mac } from './helpers';
import { store } from '../redux/store';

const zeroconf = new Zeroconf();

/**
 * Scans for Zeroconf devices.
 *
 * Iterates through specified list of protocols and scans each for 2.5 seconds, since only one
 * Zeroconf scan can be executed at once.
 *
 * @link https://github.com/balthazar/react-native-zeroconf
 */
export const zeroConfScan = async (dispatch, actions, config) => {
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
        protocol: ['ZConf'],
        timeStamp: [Date.now()],
        name: service?.name,
        model: service?.txt?.md,
        discovery: [`${service.fullName.split('.').slice(1).join('.')} (Zeroconf)`],
        txt: service.txt,
        mac,
        possibleMac,
        manufacturer,
      };

      dispatch(actions.deviceDiscovered(result));
    }
  });

  const scanDevices = async () => {
    dispatch(actions.setStartDiscoveryTime('zeroconf'));

    console.log('ZSERVICES TO SCAN', config.services);

    for (let i = 0; i < config?.services?.length; i += 1) {
      // check if task cancelled
      if (!store.getState()?.discovery?.scan) {
        return;
      }

      console.log('[zeroconf] scanning', config.services[i]);

      zeroconf.scan(config?.services[i], 'tcp', ''); // empty domain selects default

      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 2000));

      zeroconf.stop();
    }

    dispatch(actions.setEndDiscoveryTime('zeroconf'));
    zeroconf.removeAllListeners();
  };

  try {
    await scanDevices();
  } catch (error) {
    console.log('[zeroconf] ERROR', error.message);
  }
};

export const zservicesScan = () => new Promise(async (resolve) => {
  const servicesFound = [];
  zeroconf.on('found', async (service) => {
    // scannable services do not contain addresses, only discovered devices do
    if (!service.addresses) {
      console.log(
        '[zeroconf] found available service for scanning', `${service}._tcp.local.`,
      );
      servicesFound.push(service.slice(1))
    }
  });

  const scanServices = async () => {
    zeroconf.scan('services', 'dns-sd._udp', 'local');

    await new Promise((resolve) => setTimeout(resolve, 500));

    zeroconf.stop();
    zeroconf.removeAllListeners();
    resolve(servicesFound)
  };

  try {
    await scanServices();
  } catch (error) {
    console.log('[zservices] ERROR', error.message);
  }
});

import Zeroconf from 'react-native-zeroconf';
import { fetchMacVendor, ipv62mac } from './helpers'


/**
 * Scans for Zeroconf devices.
 *
 * Iterates through specified list of protocols and scans each for 2.5 seconds, since only one
 * Zeroconf scan can be executed at once.
 *
 * @link https://github.com/balthazar/react-native-zeroconf
 */

const zeroconf = new Zeroconf();

export const zeroConfScan = async (dispatch, actions, config) => {

    zeroconf.on('found', (service) => {
        console.log('[zeroconf] found available device for scanning', `${service}._tcp.local.`);
    });

    zeroconf.on('resolved', async (service) => {
        const ip = service?.addresses[0];
        console.log('[zeroconf] FOUND', ip);

        const ipv6 = service?.addresses.find((addr) => addr.includes('fe80::'));

        console.log('[zeroconf] link-local ipv6', ipv6);

        const mac = service?.txt?.mac || service?.txt?.mac_address;
        const possibleMac = ipv6 ? ipv62mac(ipv6) : '';
        let result = {
            ip,
            protocol: 'ZConf',
            timeStamp: Date.now(),
            name: service?.name,
            model: service?.txt?.md,
            discovery: `${service.fullName.split('.').slice(1).join('.')} (Zeroconf)`,
            txt: JSON.stringify(service.txt),
            mac,
            possibleMac
        }

        console.log('[zeroconf] mac', mac);
        console.log('[zeroconf] possible mac', possibleMac);


        if (!service?.txt?.usb_MFG && !service?.txt?.vendor) {
            console.log('[zeroconf] fetching mac vendor');
            try {
                const manufacturer = await fetchMacVendor(mac)
                if (!manufacturer) {
                    result.manufacturer = await fetchMacVendor(possibleMac)
                } else {
                    result.manufacturer = manufacturer
                }
            } catch (error) {
                console.log('[zeroconf] ERROR', error.message)
            }
        } else {
            result.manufacturer = service?.txt?.usb_MFG || service?.txt?.vendor
        }

        dispatch(actions.deviceDiscovered(result))
    });

    const scanDevices = async () => {

        // Dispatching an action for Initiating ZeroConf Scan
        dispatch(actions.setStartDiscoveryTime('zeroconf'))

        for (let i = 0; i < config?.services?.length; i += 1) {
            zeroconf.scan(config?.services[i], 'tcp', ''); // empty domain selects default

            // eslint-disable-next-line no-await-in-loop
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Dispatcing an action for Ending ZeroConf Scan
            zeroconf.stop();
        }

        dispatch(actions.setEndDiscoveryTime('zeroconf'))
        zeroconf.removeAllListeners();

    };

    try {
        await scanDevices()
    } catch (error) {
        console.log('[] ERROR', error.message)
    }
}


export const zservicesScan = () => new Promise(async (resolve) =>  {
    let servicesFound = []
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
})
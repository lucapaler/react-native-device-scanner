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

const protocols = ['airplay', 'ipp', 'companion-link', 'http', 'hap', 'alexa', 'ssh'];
const zeroconf = new Zeroconf();

export const zeroConfScan = async (dispatch, actions) => {

    zeroconf.on('found', (service) => {
        console.log('[zeroconf] found available service for scanning', `${service}._tcp.local.`);
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
        // zeroconf.scan('services', 'dns-sd._udp', 'local');

        for (let i = 0; i < protocols.length; i += 1) {
            zeroconf.scan(protocols[i], 'tcp', ''); // empty domain selects default

            // eslint-disable-next-line no-await-in-loop
            await new Promise((resolve) => setTimeout(resolve, 2500));

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
import dgram from 'react-native-udp';
import XMLParser from 'react-xml-parser';
// import configureStore from '../redux/store'


const xmlParser = new XMLParser();
// const { store } = configureStore()

/**
 * Parses UPnP device information.
 *
 * Checks for URL matches in raw message data to extract UPnP XML manifest file. If no match
 * found, adds device with just an IP. If a match is found, it is fetched and the returned XML
 * is parsed. Possible names for the device are found by finding elements of tag name
 * "friendlyName" and possible manufacturers by tag name "manufacturer" which both seem to be
 * standardized so far. This new information is combined with any existing information in the
 * devices map found about this IP from another protocol. Errors that occur during this fetching
 * and parsing are caught and the device is still added with just its IP and an Unknown name.
 *
 * @param {Object} newDevices Mutable copy of devices map.
 * @param {Buffer} msg        Message sent in response to UDP M-SEARCH query.
 * @param {string} ip         IP address of device.
 *
 * @returns {Object} Any new device information found combined with preexisting info.
 */


const parseUPnPDevice = async (msg, ip) => {
    const regex = /http:\/\/.+/g;

    const matches = regex.exec(msg);

    if (matches && matches.length > 0) {
        const link = matches[0];

        console.log('[UPnP] DISCOVERY INFO ', ip, 'manifest at', link);

        try {
            const response = await fetch(link, { method: 'GET' });
            const rawXml = await response.text();
            const xml = xmlParser.parseFromString(rawXml);
            const possibleNames = xml.getElementsByTagName('friendlyName');
            const possibleManufacturers = xml.getElementsByTagName('manufacturer');

            return {
                ip,
                protocol: 'UPnP',
                timeStamp: Date.now(),
                name: possibleNames.length > 0 ? possibleNames[0].value : 'Unknown',
                manufacturer: possibleManufacturers.length > 0 ? possibleManufacturers[0].value : '',
                discovery: `${link}`,
            };

        } catch (e) {

            return {
                ip,
                protocol: 'UPnP',
                timeStamp: Date.now(),
                name: 'Unknown',
                discovery: ``,
                error: `[UPnP] ${e.message}`,
            };
        }

    }

    return {
        ip,
        protocol: 'UPnP',
        timeStamp: Date.now(),
        discovery: ``,
    };

};

/**
 * Scans for UPnP Devices.
 *
 * Creates a UDP4 datagram socket and binds to port 1900, the standard port for UPnP broadcasts.
 * Sends an M-SEARCH query over the socket to the host subnet IP address to discover all UPnP
 * devices on the network. Displays error if one encountered. When a message is received, adds
 * the IP address to a "queue" array since this protocol is very chatty and duplicate devices
 * will respond instantly. If an actual message was broadcasted and there is not already an entry
 * for its IP containing UPnP discovery info (i.e. if the user has not already tapped UPnP
 * button) then the message is parsed and a copy of the devices map is updated and then the state
 * is set. Scans for 2.5 seconds.
 *
 * @link https://www.electricmonk.nl/log/2016/07/05/exploring-upnp-with-python
 * @link https://github.com/tradle/react-native-udp
 *
 * @listens message
 */

export const detectUPnPDevices = async (dispatch, actions) => {

    const socket = dgram.createSocket({ type: 'udp4', debug: true })
    socket.bind(1900);
    socket.once('listening', () => {
        // Dispatching an action for Initiating Upnp Scan
        dispatch(actions.setStartDiscoveryTime('upnp'))
        console.log('[UPnP] LISTENING')
        socket.send('M-SEARCH * HTTP/1.1\r\nHOST:239.255.255.250:1900\r\nST: ssdp:all\r\nMX:2\r\nMAN:"ssdp:discover"\r\n\r\n', undefined, undefined, 1900, '239.255.255.250', (error) => {
            if (error) console.log('[UPnP] INITIAL ERROR ', error.message);
        });
    });

    const queue = [];

    socket.on('message', async (msg, { address }) => {
        if (!queue.includes(address)) {
            queue.push(address);
            console.log('[upnp] FOUND', address);

            if (msg) {
                try {
                    const deviceInfo = await parseUPnPDevice(msg, address)
                    //Dispatching an action for discovered
                    dispatch(actions.deviceDiscovered(deviceInfo))
                    console.log('[UPnP] RESOLVED ', JSON.stringify(deviceInfo, null, 2))
                } catch (error) {
                    console.log('[UPnP] ERROR ', error.message)
                }
            }

        }
    });

    await new Promise((resolve) => setTimeout(resolve, 10000));
    // Dispatcing an action for Ending Upnp Scan
    dispatch(actions.setEndDiscoveryTime('upnp'))
    socket.removeAllListeners();
    socket.close();

};
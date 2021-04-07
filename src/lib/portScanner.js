import TcpSocket from 'react-native-tcp-socket';
import Ping from 'react-native-ping';
import { networkPromise } from './helpers'


// const networkPromise = () => new Promise(async function (resolve, reject) {
//     try {

//       const net_info = await NetInfo.fetch()
//       console.log('NET_INFO', net_info)
//       const local_ip = net_info.details.ipAddress
//       console.log('IP', local_ip)
//       const local_broadcast = await NetworkInfo.getBroadcast()
//       console.log('BROADCAST', local_broadcast)
//       const local_netmask = net_info.details.subnet
//       console.log('NETMASK', local_netmask)
//       const subconv = ipaddr.IPv4.parse(local_netmask).prefixLengthFromSubnetMask()
//       console.log('SUBCONV', subconv)
//       const firstHost = ipaddr.IPv4.networkAddressFromCIDR(local_ip + "/" + subconv)
//       console.log('FIRSTHOST', firstHost)
//       const lastHost = ipaddr.IPv4.broadcastAddressFromCIDR(local_ip + "/" + subconv)
//       console.log('LASTHOST', lastHost)
//       const firstHostHex = sip.convertIPtoHex(firstHost)
//       console.log('FIRSTHEX', firstHostHex)
//       const lastHostHex = sip.convertIPtoHex(lastHost)
//       console.log('LASTHEX', lastHostHex)
//       const ipRange = sip.getIPRange(firstHostHex, lastHostHex);
//       const newIpRange = ipRange.length ? ipRange.slice(1) : ipRange
//       console.log('IP_RANGEE', newIpRange)


//       const result = {
//         local_ip,
//         local_broadcast,
//         local_netmask,
//         subconv,
//         firstHost,
//         lastHost,
//         firstHostHex,
//         lastHostHex,
//         ipRange: newIpRange
//       }
//       resolve(result)

//     } catch (error) {
//       console.log(error)
//     }
//   });


// const ping = (range) => new Promise(async (resolve) => {
//     let active_ips = []
//     for (const ip of range) {
//         try {
//             const status = await Ping.start(ip, { timeout: 100 })
//             active_ips.push(ip)
//         } catch (error) { }
//     }
//     resolve(active_ips)
// })

const portScanner = (ip) => new Promise (async (resolve) => {
    let port_status = []
    const ports = [22, 80, 443, 7070, 8081]
    for (const port of ports){
        try {
            const resp = await scanHost(ip, port)
            port_status.push(resp)
        } catch (error) { }
    }

    // const open_ports = port_status.filter(x => x.status === 'FINISHED')
    // if(open_ports.length){
    //     for(const open_port of open_ports){
    //         bannerGrabTCPHost(open_port.ip, open_port.port)
    //     }
    // }

    resolve(port_status)
})

// export const ScanIps = () => new Promise (async (resolve) => {
//     try {

//         const response = await networkPromise()
//         const active_ips = await ping(response['ipRange'])
//         console.log(active_ips)
//         resolve(active_ips)
//         // for(const ip of active_ips){
//         //     const port_status = await portScanner(ip)
//         //     return port_status
//         //     console.log('######')
//         //     console.log(port_status)
//         //     console.log('######')
//         // }
//     } catch (error) {
//         console.log('[PORT SCANNER ERROR]', error)
//     }
// })



export const ScanIps = async (dispatch, actions, config) => {
    try {

        // console.log('##################################',timeout)

        // Dispatching an action for Initiating ZeroConf Scan
        dispatch(actions.setStartDiscoveryTime('ipScan'))

        // const response = await networkPromise()
        for (const ip of config['ipRange']) {
            // for (const ip of response['ipRange']) {
            try {
                const status = await Ping.start(ip, { timeout: config.timeout })
                dispatch(actions.deviceDiscovered({ip, protocol: 'IP-Scan', timeStamp: Date.now() }))
            } catch (error) { }
        } 

        dispatch(actions.setEndDiscoveryTime('ipScan'))

    } catch (error) {
        console.log('[PORT SCANNER ERROR]', error)
    }
}

export const ScanPorts = (ip) => new Promise(async (resolve) => {
    try {
        console.log(ip)
        const port_status = await portScanner(ip)
        console.log(port_status)
        resolve(port_status)
    } catch (error) {}
})

/**
 * Banner grabs TCP host.
 *
 * Creates connection to presumably previously tested and open port on specified IP address.
 * Writes basic GET request in order to return 404 information which sometimes contains target
 * OS, manufacturer, model, etc.
 *
 * @link https://www.shift8web.ca/2019/03/how-to-build-a-port-scanner-with-javascript-using-react-native
 * @link https://github.com/aprock/react-native-tcp
 *
 * @param {string} host IP address of host to connect to.
 * @param {number} port TCP port to connect to.
 */
const bannerGrabTCPHost = (host, port) => {
    let banners = []

    const client = TcpSocket.createConnection({
        port: port,
        host: host,
        // tls: true,
        tlsCheckValidity: false, // Disable validity checking
        // tlsCert: require('./selfmade.pem') // Self-signed certificate
    });

    client.on('data', (data) => {
        banners.push(data)

        // Log the response from the HTTP server.
        console.log(`RESPONSE:`, Buffer.concat(banners));
    }).on('connect', () => {
        // Manually write an HTTP request.
        client.write('GET / HTTP/1.0\r\n\r\n');
        // console.log(`CONNECTED : ${host} ${port}`);
    }).on('end', () => {
        // console.log('DONE');
        client.close();
    });
};

/**
 * Attempts to connect to device.
 *
 * Tries to open TCP connection to specified host and port, logs relevant debug information and
 * returns back the specified IP and port if a successful connection was made. Has manual timeout
 * of 5 seconds if socket is not closed before then.
 *
 * @link https://www.shift8web.ca/2019/03/how-to-build-a-port-scanner-with-javascript-using-react-native
 * @link https://github.com/aprock/react-native-tcp
 *
 * @param {string} hostIP   IP address of host to attempt to connect to.
 * @param {number} hostPort Port to attempt to connect to.
 *
 * @returns {Promise} Promise that resolves to map of specified IP and port or rejects with
 *                    error.
 */
const scanHost = (hostIP, hostPort) => new Promise((resolve, reject) => {

    const client = TcpSocket.createConnection({
        port: hostPort,
        host: hostIP,
        // tls: true,
        tlsCheckValidity: false, // Disable validity checking
    }, () => {
        client.end('finished');

        const scanResult = {
            ip: hostIP,
            port: hostPort,
            status: 'FINISHED'
        };

        resolve(scanResult);
    });

    client.on('timeout', () => {
        // console.log('Socket timed out !');
        client.end('Timed out!');
        resolve({
            ip: hostIP,
            port: hostPort,
            status: 'TIMEOUT'
        })
    });

    client.on('end', (data) => {
        // console.log('Socket ended from other end!');
        // console.log(`End data : ${data}`);
        resolve({
            ip: hostIP,
            port: hostPort,
            status: 'END'
        });
    });

    client.on('close', (error) => {
        // const bread = client.bytesRead;
        // const bwrite = client.bytesWritten;
        // console.log(`Bytes read : ${bread}`);
        // console.log(`Bytes written : ${bwrite}`);
        // console.log('Socket closed!');
        resolve({
            ip: hostIP,
            port: hostPort,
            status: 'CLOSED'
        })
        if (error) {
            console.log('Socket was closed as a result of transmission error');
        }
    });

    client.on('error', (err) => {
        const refused = err.split(" ").includes('ECONNREFUSED')
        client.destroy();
        if (refused) {
            resolve({
                ip: hostIP,
                port: hostPort,
                status: 'REFUSED'
            })
        } else {
            reject(err)
        }
    });

    setTimeout(() => {
        const isdestroyed = client.destroyed;
        client.destroy();
        resolve({})
    }, 5000);
});


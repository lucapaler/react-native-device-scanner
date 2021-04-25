import TcpSocket from 'react-native-tcp-socket';
import Ping from 'react-native-ping';

import { store } from '../redux/store';
import {
  setStartDiscoveryTime, deviceDiscovered, setEndDiscoveryTime,
} from '../redux/actions/discovery';

const portScanner = async (ip) => {
  const portStatuses = [];
  const ports = [22, 80, 443, 7070, 8081];

  await Promise.all(ports.map(async (port) => scanHost(ip, port)
    .then((response) => {
      portStatuses.push(response);
    })
    .catch((error) => {
      console.log('[port scanner] ERROR', error);
    })));

  // const open_ports = port_status.filter(x => x.status === 'FINISHED')
  // if(open_ports.length){
  //     for(const open_port of open_ports){
  //         bannerGrabTCPHost(open_port.ip, open_port.port)
  //     }
  // }

  return portStatuses;
};

export const scanIpRange = async (dispatch, config) => {
  try {
    dispatch(setStartDiscoveryTime('ipScan'));

    for (let i = 0; i < config.ipRange.length; i += 1) {
      if (!store.getState()?.discovery?.scan) {
        return;
      }

      try {
        // eslint-disable-next-line no-await-in-loop
        await Ping.start(config.ipRange[i], { timeout: config.timeout });

        dispatch(deviceDiscovered({
          ip: config.ipRange[i],
          protocol: ['IP-Scan'],
          timeStamp: [Date.now()],
          discovery: ['IP Scan'],
        }));
      } catch (error) {
        if (error.code !== '3') {
          console.log('[IP scanner] ERROR', error);
        }
      }
    }

    dispatch(setEndDiscoveryTime('ipScan'));
  } catch (error) {
    console.log('[port scanner] ERROR', error);
  }
};

export const ScanPorts = (ip) => new Promise(async (resolve) => {
  try {
    console.log(ip);
    const port_status = await portScanner(ip);
    console.log(port_status);
    resolve(port_status);
  } catch (error) { }
});

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
  const banners = [];

  const client = TcpSocket.createConnection({
    port,
    host,
    // tls: true,
    tlsCheckValidity: false, // Disable validity checking
    // tlsCert: require('./selfmade.pem') // Self-signed certificate
  });

  client.on('data', (data) => {
    banners.push(data);

    // Log the response from the HTTP server.
    console.log('RESPONSE:', Buffer.concat(banners));
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
      status: 'FINISHED',
    };

    resolve(scanResult);
  });

  client.on('timeout', () => {
    // console.log('Socket timed out !');
    client.end('Timed out!');
    resolve({
      ip: hostIP,
      port: hostPort,
      status: 'TIMEOUT',
    });
  });

  client.on('end', (data) => {
    // console.log('Socket ended from other end!');
    // console.log(`End data : ${data}`);
    resolve({
      ip: hostIP,
      port: hostPort,
      status: 'END',
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
      status: 'CLOSED',
    });
    if (error) {
      console.log('Socket was closed as a result of transmission error');
    }
  });

  client.on('error', (err) => {
    const refused = err.split(' ').includes('ECONNREFUSED');
    client.destroy();
    if (refused) {
      resolve({
        ip: hostIP,
        port: hostPort,
        status: 'REFUSED',
      });
    } else {
      reject(err);
    }
  });

  setTimeout(() => {
    const isdestroyed = client.destroyed;
    client.destroy();
    resolve({});
  }, 5000);
});

import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Button,
  Alert,
} from 'react-native';

import { ScanPorts, ScanIps } from './src/lib/portScanner'
// import net from 'react-native-tcp';
import Zeroconf from 'react-native-zeroconf';
import { BleManager } from 'react-native-ble-plx';
import base64 from 'react-native-base64';
import dgram from 'react-native-udp';
import XMLParser from 'react-xml-parser';
import * as Sentry from '@sentry/react-native';

import cids from './companyIdentifiers';

Sentry.init({
  dsn: 'https://b86985aa986b430ea1e6334eeb2eb243@o389415.ingest.sentry.io/5648195',
});

const protocols = ['airplay', 'ipp', 'companion-link', 'http', 'hap', 'alexa', 'ssh'];

export default function App() {
  const [devices, setDevices] = useState({});
  const [isLoading, load] = useState(false);
  const [isDataVisible, showData] = useState([]);
  const bleManager = useRef(new BleManager());
  const [ActiveIp, setActiveIp] = useState([])
  const [portStatus, setPortStatus] = useState({})
  const zeroconf = new Zeroconf();
  const xmlParser = new XMLParser();

  const devicesBackup = useRef({});

  useEffect(() => {
    const subscription = bleManager.current.onStateChange((state) => {
      if (state === 'PoweredOn') {
        console.log('Bluetooth ready');
        subscription.remove();
      }
    }, true);

    return () => {
      bleManager.current.destroy();
    };
  }, []);

  useEffect(()=> {
    console.log(portStatus)
  },[portStatus])

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
  const ipv62mac = (ipv6) => {
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
   * Fetches MAC vendor information.
   *
   * @link https://maclookup.app/api-v2/documentation
   *
   * @param {string} mac Target MAC address.
   *
   * @returns {string} MAC vendor, if found, else empty result.
   */
  const fetchMacVendor = async (mac) => {
    if (mac) {
      return fetch(`https://api.maclookup.app/v2/macs/${mac}`)
        .then((response) => response.json())
        .then(({ found, company }) => {
          if (found) return company;

          return '';
        });
    }

    return '';
  };

  /**
   * Parses resolved Zeroconf services.
   *
   * Attempts to extract manufacturer information by mDNS TXT values. Attempts to find MAC also in
   * TXT field or by calculating from IPv6 address, if link-local address is present. Combines this
   * and name and model info with any existing info about device IP.
   *
   * @see ipv62mac
   * @see fetchMacVendor
   * @see setDevices
   *
   * @listens resolved
   * @listens found
   *
   * @returns {function} Removes all Zeroconf listeners in cleanup.
   */
  useEffect(() => {
    zeroconf.on('found', (service) => {
      console.log('[zeroconf] found available service for scanning', `${service}._tcp.local.`);
    });

    zeroconf.on('resolved', (service) => {
      const ip = service.addresses[0];

      console.log('[zeroconf] found', ip);

      if (!Object.keys(devices).includes(ip)) {
        const ipv6 = service.addresses.find((addr) => addr.includes('fe80::'));

        console.log('[zeroconf] link-local ipv6', ipv6);

        const newDevices = { ...devices };

        const existingInfo = newDevices[ip] || {};

        const mac = service.txt.mac || service.txt.mac_address || existingInfo.mac;
        const possibleMac = (ipv6 ? ipv62mac(ipv6) : '') || existingInfo.possibleMac;

        console.log('[zeroconf] mac', mac);
        console.log('[zeroconf] possible mac', possibleMac);

        if (!service.txt.usb_MFG && !service.txt.vendor && !existingInfo.manufacturer) {
          console.log('[zeroconf] fetching mac vendor');
          fetchMacVendor(mac)
            .then((manufacturer) => {
              if (!manufacturer) {
                fetchMacVendor(possibleMac)
                  .then((possibleManufacturer) => {
                    newDevices[ip] = {
                      name: service.name || existingInfo.name,
                      model: service.txt.md || existingInfo.model,
                      manufacturer: possibleManufacturer,
                      mac,
                      possibleMac,
                      discovery: `${service.fullName.split('.').slice(1).join('.')} (Zeroconf)${existingInfo.discovery ? `, ${existingInfo.discovery}` : ''}`,
                      txt: JSON.stringify(service.txt) || existingInfo.txt,
                      id: ip,
                    };

                    console.log('[zeroconf] resolved', JSON.stringify(newDevices[ip], null, 2));

                    setDevices(newDevices);
                    devicesBackup.current = newDevices;
                  });
              } else {
                newDevices[ip] = {
                  name: service.name || existingInfo.name,
                  model: service.txt.md || existingInfo.model,
                  manufacturer,
                  mac,
                  possibleMac,
                  discovery: `${service.fullName.split('.').slice(1).join('.')} (Zeroconf)${existingInfo.discovery ? `, ${existingInfo.discovery}` : ''}`,
                  txt: JSON.stringify(service.txt) || existingInfo.txt,
                  id: ip,
                };

                console.log('[zeroconf] resolved', JSON.stringify(newDevices[ip], null, 2));

                setDevices(newDevices);
              }
            });
        } else {
          newDevices[ip] = {
            name: service.name || existingInfo.name,
            model: service.txt.md || existingInfo.model,
            manufacturer: service.txt.usb_MFG || service.txt.vendor || existingInfo.manufacturer,
            mac,
            possibleMac,
            discovery: `${service.fullName.split('.').slice(1).join('.')} (Zeroconf)${existingInfo.discovery ? `, ${existingInfo.discovery}` : ''}`,
            txt: JSON.stringify(service.txt) || existingInfo.txt,
            id: ip,
          };

          console.log('[zeroconf] resolved', JSON.stringify(newDevices[ip], null, 2));

          setDevices(newDevices);
        }
      }
    });

    return () => {
      zeroconf.removeAllListeners();
    };
  }, [devices]);

  /**
   * Extracts company identifier.
   *
   * Decodes manufacturer data packet sent with Bluetooth device discoveries, takes the first two
   * bytes, flips them around and appends "0x" to be matched with the BLE manufacturer list.
   *
   * @param {string} manufacturerData Base64-encoded string of manufacturer-specific data.
   *
   * @returns {string} Extracted company identifier.
   */
  const getCompanyIdentifier = (manufacturerData) => {
    const raw = base64.decode(manufacturerData);
    let result = '0x';

    const byte1 = raw.charCodeAt(0).toString(16);
    const byte2 = raw.charCodeAt(1).toString(16);

    result += (byte2.length === 2 ? byte2 : `0${byte2}`).toUpperCase();
    result += (byte1.length === 2 ? byte1 : `0${byte1}`).toUpperCase();

    return result;
  };

  /**
   * Scans for Bluetooth devices.
   *
   * Starts Bluetooth Low Energy device scan for 6 seconds. When device is returned, treats UUID as
   * device IP address (MAC address on Android instead of UUID). Combines preexisting device data
   * with either device's local name or name if either exist. If manufacturer data is returned,
   * extracts company identifier and matches to manufacturer list. Adds rest of manufacturer data
   * to TXT field for visualization, sometimes it contains random bits of human-readable text.
   *
   * @see  getCompanyIdentifier
   * @see  setDevices
   * @link https://polidea.github.io/react-native-ble-plx
   */
  const detectBluetoothDevices = async () => {
    load(true);

    const newDevices = { ...devicesBackup.current };

    bleManager.current.startDeviceScan(null, null, (error, device) => {
      if (error) console.log('BLE ERROR', error);

      const uuid = device.id;

      console.log('[bluetooth] found', uuid);

      const existingInfo = newDevices[uuid] || {};

      newDevices[uuid] = {
        name: device.localName || existingInfo.name || device.name || 'Unknown',
        id: uuid,
        manufacturer: device.manufacturerData
          ? cids[getCompanyIdentifier(device.manufacturerData)]
          : existingInfo.manufacturer,
        mac: uuid,
        discovery: 'Bluetooth',
        txt: device.manufacturerData ? base64.decode(device.manufacturerData) : '',
      };

      console.log('[bluetooth] resolved', JSON.stringify(newDevices[uuid], null, 2));
    });

    await new Promise((resolve) => setTimeout(resolve, 6000));

    bleManager.current.stopDeviceScan();

    setDevices(newDevices);

    load(false);
  };

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
  const parseUPnPDevice = async (newDevices, msg, ip) => {
    const regex = /http:\/\/.+/g;

    const existingInfo = newDevices[ip] || {};

    const matches = regex.exec(msg);

    if (matches && matches.length > 0) {
      const link = matches[0];

      console.log('[upnp]', ip, 'manifest at', link);

      try {
        const response = await fetch(link, { method: 'GET' });

        const rawXml = await response.text();

        const xml = xmlParser.parseFromString(rawXml);

        const possibleNames = xml.getElementsByTagName('friendlyName');
        const possibleManufacturers = xml.getElementsByTagName('manufacturer');

        return {
          name: existingInfo.name || possibleNames.length > 0 ? possibleNames[0].value : 'Unknown',
          id: ip,
          manufacturer: existingInfo.manufacturer
            || possibleManufacturers.length > 0 ? possibleManufacturers[0].value : '',
          discovery: `${existingInfo.discovery ? `${existingInfo.discovery}, ` : ''}UPnP - ${link}`,
        };
      } catch (e) {
        return {
          name: 'Unknown',
          id: ip,
          discovery: `${existingInfo.discovery ? `${existingInfo.discovery}, ` : ''}UPnP`,
          error: e.message,
        };
      }
    }

    return {
      id: ip,
      discovery: `${existingInfo.discovery ? `${existingInfo.discovery}, ` : ''}UPnP`,
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
  const detectUPnPDevices = async () => {
    load(true);

    const socket = dgram.createSocket({ type: 'udp4', debug: true })
    socket.bind(1900);
    socket.once('listening', () => {
      console.log('[LISTENING]')
      socket.send('M-SEARCH * HTTP/1.1\r\nHOST:239.255.255.250:1900\r\nST: ssdp:all\r\nMX:2\r\nMAN:"ssdp:discover"\r\n\r\n', undefined, undefined, 1900, '239.255.255.250', (error) => {
        if (error) Alert.alert('UPnP Error', error.message);
      });
    });

    const newDevices = { ...devicesBackup.current };
    console.log(newDevices)
    const queue = [];

    socket.on('message', (msg, { address }) => {
      console.log(msg, address)
      if (!queue.includes(address)) {
        queue.push(address);

        console.log('[upnp] found', address);

        if (msg && !(newDevices[address] && newDevices[address].discovery.includes('UPnP - '))) {
          parseUPnPDevice(newDevices, msg, address)
            .then((parsed) => {
              newDevices[address] = parsed;

              console.log('[upnp] resolved', JSON.stringify(parsed, null, 2));
            })
            .catch((error) => {
              Alert.alert('UPnP Error', error.message);
            });
        }
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 10000));

    setDevices(newDevices);
    devicesBackup.current = newDevices;

    socket.removeAllListeners();
    socket.close();

    load(false);
  };

  /**
   * Scans for Zeroconf devices.
   *
   * Iterates through specified list of protocols and scans each for 2.5 seconds, since only one
   * Zeroconf scan can be executed at once.
   *
   * @link https://github.com/balthazar/react-native-zeroconf
   */
  const scanDevices = async () => {
    load(true);

    for (let i = 0; i < protocols.length; i += 1) {
      zeroconf.scan(protocols[i], 'tcp', ''); // empty domain selects default

      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 2500));

      zeroconf.stop();
    }

    load(false);
  };

  const buttons = [
    {
      title: 'Zeroconf',
      func: scanDevices,
    },
    {
      title: 'UPnP',
      func: detectUPnPDevices,
    },
    {
      title: 'Bluetooth',
      func: detectBluetoothDevices,
    },
    {
      title: 'Manual Scan',
      func: async () =>{ 
          load(true); 
          const res =  await ScanIps()
          setActiveIp(res)
          setPortStatus({})
          load(false) 
        }  ,
    },
  ];

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'stretch',
      marginTop: 80,
    }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {buttons.map(({ title, func }) => (
          <TouchableOpacity
            key={title}
            disabled={isLoading}
            onPress={func}
            style={{
              backgroundColor: '#5000bf',
              flex: 1,
              marginHorizontal: 20,
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: 'center',
            }}
          >
            {isLoading
              ? <ActivityIndicator color="white" size="small" />
              : <Text style={{ fontSize: 18, color: 'white' }}>{title}</Text>}
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={{ paddingHorizontal: 20 }}>
        {
          ActiveIp.map((ip, idx) => (
            <TouchableOpacity key={idx}
        style={{marginBottom:'1%', padding: '2%', backgroundColor: 'yellow'}}
        onPress={async () => { const res = await ScanPorts(ip); setPortStatus({...portStatus,[`${ip}`]:res})} }
      >
          <View key={idx} >
              <Text>{ip}</Text>
              <Text>{`${JSON.stringify(portStatus?.[`${ip}`])}`}</Text>
            </View>
            </TouchableOpacity>)
          )
        }
        {Object.values(devices).map(({
          name = '', model = '', id = '', manufacturer = '', mac = '', discovery = '', txt = '',
          possibleMac = '', error = '',
        }) => {
          const visible = isDataVisible.includes(id);

          return (
            <View key={id}>
              <View style={{ marginVertical: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{name}</Text>
                  <Text>{`Manufacturer: ${manufacturer}`}</Text>
                  <Text>{`Model: ${model}`}</Text>
                  <Text>{`MAC: ${mac}`}</Text>
                  <Text>{`Possible MAC: ${possibleMac}`}</Text>
                  {!!error && (
                    <Text style={{ color: 'red' }}>{`Error: ${error}`}</Text>
                  )}
                  <Text>{`Discovery: ${discovery}`}</Text>
                  {!!txt && (
                    <View style={{ alignSelf: 'flex-start' }}>
                      <Button
                        title={visible ? 'Hide Data' : 'Show Data'}
                        onPress={() => {
                          if (visible) {
                            showData(isDataVisible.filter((existingId) => existingId !== id));
                          } else showData([...isDataVisible, id]);
                        }}
                      />
                    </View>
                  )}
                  {visible && <Text>{txt}</Text>}
                </View>
                <Text style={{ fontSize: 16 }}>{id.includes('-') ? '' : id}</Text>
              </View>
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: 'gray' }} />
            </View>
          );
        })}
      </ScrollView>
      <Text style={{ textAlign: 'center', fontSize: 12, color: 'gray' }}>Version 0.0.14</Text>
    </SafeAreaView>
  );
}

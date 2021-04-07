import { NetworkInfo } from 'react-native-network-info';
import sip from 'shift8-ip-func';
import ipaddr from 'ipaddr.js';
import NetInfo from "@react-native-community/netinfo";


/**
 * Fetches MAC vendor information.
 *
 * @link https://maclookup.app/api-v2/documentation
 *
 * @param {string} mac Target MAC address.
 *
 * @returns {string} MAC vendor, if found, else empty result.
 */


export const fetchMacVendor = (mac) => new Promise( async (resolve, reject) => {
    if (mac) {
        try {
            const response = await fetch(`https://api.maclookup.app/v2/macs/${mac}`)
            const { found, company } = await response.json()
            if (found) resolve(company)
        } catch (error) {
            reject(error)
        }
    }

    resolve('');
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

export const networkPromise = (values) => new Promise(async function (resolve, reject) {
    try {

      const net_info = await NetInfo.fetch()
      console.log('NET_INFO', net_info)
      const local_ip = values?.local_ip || net_info.details.ipAddress
      console.log('IP', local_ip)
      const local_broadcast = await NetworkInfo.getBroadcast()
      console.log('BROADCAST', local_broadcast)
      const local_netmask = values?.local_netmask || net_info.details.subnet
      console.log('NETMASK', local_netmask)
      const subconv = ipaddr.IPv4.parse(local_netmask).prefixLengthFromSubnetMask()
      console.log('SUBCONV', subconv)
      const firstHost = ipaddr.IPv4.networkAddressFromCIDR(local_ip + "/" + subconv)
      console.log('FIRSTHOST', firstHost)
      const lastHost = ipaddr.IPv4.broadcastAddressFromCIDR(local_ip + "/" + subconv)
      console.log('LASTHOST', lastHost)
      const firstHostHex = sip.convertIPtoHex(firstHost)
      console.log('FIRSTHEX', firstHostHex)
      const lastHostHex = sip.convertIPtoHex(lastHost)
      console.log('LASTHEX', lastHostHex)
      const ipRange = sip.getIPRange(firstHostHex, lastHostHex);
      const newIpRange = ipRange.length ? ipRange.slice(1) : ipRange
    //   console.log('IP_RANGEE', newIpRange)


      const result = {
        local_ip,
        local_broadcast,
        local_netmask,
        subconv,
        firstHost,
        lastHost,
        firstHostHex,
        lastHostHex,
        ipRange: newIpRange
      }
      resolve(result)

    } catch (error) {
      console.log(error)
    }
  });
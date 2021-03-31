import * as types from '../types/discovery';

export function startDiscovery(dispatch) {
  return {
    type: types.START_DISCOVERY,
    dispatch
  }
}

export function endDiscovery() {
  return {
    type: types.END_DISCOVERY
  }
}

export function errorDiscovery(protocol, error) {
  return {
    type: types.ERROR_DISCOVERY,
    protocol,
    error
  }
}

export function deviceDiscovered(info) {
  return {
    type: types.DEVICE_DISCOVERED,
    info
  }
}

export function zserviceDiscovered(info) {
  return {
    type: types.ZSERVICE_DISCOVERED,
    info,
  };
}

export function setStartDiscoveryTime(protocol) {
  return {
    type: types.SET_START_DISCOVERY_TIME,
    protocol
  }
}


export function setEndDiscoveryTime(protocol) {
  return {
    type: types.SET_END_DISCOVERY_TIME,
    protocol
  }
}

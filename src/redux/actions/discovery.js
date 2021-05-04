import * as types from '../types/discovery';

export function startDiscovery(dispatch, config, isHeadless) {
  return {
    type: types.START_DISCOVERY,
    config,
    dispatch,
    isHeadless,
  };
}

export function endDiscovery() {
  return {
    type: types.END_DISCOVERY
  }
}

export function terminateScan() {
  return {
    type: types.TERMINATE_SCAN
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

export function setDiscoveryConfig(protocol, config) {
  return {
    type: types.SET_DISCOVERY_CONFIG,
    protocol,
    config
  }
}

export function requestDiscoveryConfig(values) {
  return {
    type: types.REQUEST_DISCOVERY_CONFIG,
    values
  }
}

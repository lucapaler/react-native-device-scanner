import {
  call, put, fork, take, cancelled, cancel, select, all,
} from 'redux-saga/effects';

import publicIP from 'react-native-public-ip';
import { NetworkInfo } from 'react-native-network-info';

import detectUPnPDevices from '../../../lib/upnp';
import { zeroconfScan, zservicesScan } from '../../../lib/zeroconf';
import { scanIpRange } from '../../../lib/portScanner';
import { networkPromise, apiFetch, scanBSSIDs } from '../../../lib/helpers';
import * as actions from '../../actions/discovery';
import * as types from '../../types/discovery';

function* ipScanner(action) {
  try {
    yield call(scanIpRange, action.dispatch, action.config.ipScan);
  } finally {
    if (yield cancelled()) {
      yield put(actions.setEndDiscoveryTime('ipScan'));
    }
  }
}

function* upnpScan(action) {
  try {
    yield call(detectUPnPDevices, action.dispatch);
  } finally {
    if (yield cancelled()) {
      yield put(actions.setEndDiscoveryTime('upnp'));
    }
  }
}

function* zconfScan(action) {
  try {
    yield call(zeroconfScan, action.dispatch, action.config.zeroconf);
  } finally {
    if (yield cancelled()) {
      yield put(actions.setEndDiscoveryTime('zeroconf'));
    }
  }
}

function* runTasks(action) {
  if (action.isHeadless) {
    yield all([
      call(upnpScan, action),
      call(zconfScan, action),
      call(ipScanner, action),
    ]);
  } else {
    const upnp = yield fork(upnpScan, action);
    const zconf = yield fork(zconfScan, action);
    const ipScan = yield fork(ipScanner, action);

    yield take(types.TERMINATE_SCAN);
    yield cancel(ipScan);
    yield cancel(upnp);
    yield cancel(zconf);
  }
}

function* saveScan(pid, scan) {
  const parsedScan = { ...scan };

  delete parsedScan.config.ipScan.ipRange;

  yield call(apiFetch, {
    method: 'POST',
    endpoint: 'scans/scan',
    body: {
      pid,
      nid: yield publicIP(),
      scan: parsedScan,
    },
  });
}

export function* startDiscoveryAsync(action) {
  try {
    yield call(runTasks, action);
    yield put(actions.endDiscovery());

    const pid = yield select((state) => state.profile.pid);
    const result = yield select((state) => state.discovery.last);

    yield call(saveScan, pid, result);
  } catch (error) {
    console.log(error);
  }
}

export function* requestConfigAsync(action) {
  try {
    const { values } = action;
    const ipScan = yield call(networkPromise, values?.ipScan);
    const zeroconfServices = yield call(zservicesScan);
    const config = {
      bssids: yield scanBSSIDs(),
      gateway: yield NetworkInfo.getGatewayIPAddress(),
      ipScan: {
        ...ipScan,
        timeout: values?.ipScan?.timeout || 100,
      },
      zeroconf: {
        services: Object.keys(values?.zeroConf || {})?.includes('services')
          ? values.zeroconf.services
          : zeroconfServices,
      },
    };

    yield put(actions.setDiscoveryConfig(null, config));
  } catch (error) {
    console.log(error);
  }
}

import { takeLatest } from 'redux-saga/effects';
import { START_DISCOVERY, REQUEST_DISCOVERY_CONFIG } from '../../types/discovery';
import { startDiscoveryAsync, requestConfigAsync } from './saga';

export default [
  takeLatest(START_DISCOVERY, startDiscoveryAsync),
  takeLatest(REQUEST_DISCOVERY_CONFIG, requestConfigAsync),
];

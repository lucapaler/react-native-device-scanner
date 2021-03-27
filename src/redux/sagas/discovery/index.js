import { takeLatest } from 'redux-saga/effects'
import * as types from '../../types/discovery';
import * as sagas from './saga'

export const discoverySagas = [
    takeLatest(types.START_DISCOVERY, sagas.startDiscoveryAsync),
];

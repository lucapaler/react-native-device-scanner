import { call, put, fork, select } from 'redux-saga/effects';
import { detectUPnPDevices } from '../../../lib/upnp'
import { zservicesScan, zeroConfScan } from '../../../lib/zeroconf';
import { ScanIps } from '../../../lib/portScanner'
import * as actions from '../../actions/discovery'
import { getZServices } from './selectors';
// import configureStore from '../../store';
// const { store } = configureStore()

function* ipScanner(action){
    yield call(ScanIps, action.dispatch, actions, 100)
}

function* upnpScan(action) {
    yield call(detectUPnPDevices, action.dispatch, actions)
} 

function* zconfScan(action) {
    yield call(zservicesScan, action.dispatch, actions);

    const zservices = yield select(getZServices);

    yield call(zeroConfScan, action.dispatch, actions, zservices);
}

function* runTasks(action){
    yield fork(upnpScan, action)
    yield fork(zconfScan, action)
    yield fork(ipScanner, action)
}


export function* startDiscoveryAsync(action) {
    try {
        console.log('START DISCOVERY')
        yield call(runTasks, action)
        // yield call(detectUPnPDevices, action.dispatch, actions)
        // yield call(zeroConfScan, action.dispatch, actions)
        yield put(actions.endDiscovery())
        console.log('DONE')
    } catch (error) {
        console.log(error)
    }
}
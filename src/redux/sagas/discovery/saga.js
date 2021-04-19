import { call, put, fork, take, cancelled, cancel } from 'redux-saga/effects';
import { detectUPnPDevices } from '../../../lib/upnp'
import { zeroConfScan } from '../../../lib/zeroconf'
import { ScanIps } from '../../../lib/portScanner'
import { networkPromise } from '../../../lib/helpers'
import { zservicesScan } from '../../../lib/zeroconf'
import * as actions from '../../actions/discovery'
import * as types from '../../types/discovery';


function* ipScanner(action){
    try {
        yield call(ScanIps, action.dispatch, actions, action.config.ipScan)
    } finally {
        if(yield cancelled()) {
            yield put(actions.setEndDiscoveryTime('ipScan'))
        }
    }
}

function* upnpScan(action) {
    try{
        yield call(detectUPnPDevices, action.dispatch, actions)
    } finally {
        if(yield cancelled()) {
            yield put(actions.setEndDiscoveryTime('upnp'))
        }
    }
} 

function* zconfScan(action){
    try {
        yield call(zeroConfScan, action.dispatch, actions, action.config.zeroConf)
    } finally {
        if(yield cancelled()) {
            yield put(actions.setEndDiscoveryTime('zeroconf'))
        }
    }
}

function* runTasks(action){
    const upnp = yield fork(upnpScan, action)
    const zconf = yield fork(zconfScan, action)
    const ipScan = yield fork(ipScanner, action)

    yield take(types.TERMINATE_SCAN)
    yield cancel(ipScan)
    yield cancel(upnp)
    yield cancel(zconf)
}


export function* startDiscoveryAsync(action) {
    try {
        yield call(runTasks, action)
        yield put(actions.endDiscovery())
    } catch (error) {
        console.log(error)
    }
}

export function* requestConfigAsync(action) {
    try {
        const { values } = action
        const ipScan = yield call(networkPromise, values?.ipScan)
        const zeroConfServices = yield call(zservicesScan, values?.zeroConf)
        const config = {
            ipScan:{
                ...ipScan,
                timeout: values?.ipScan?.timeout || 100
            },
            zeroConf: {
                services: Object.keys(values?.zeroConf || {})?.includes("services") ? values.zeroConf.services : zeroConfServices
            }
        }
        yield put(actions.setDiscoveryConfig(null, config))        
    } catch (error) {
        console.log(error)
    }
}
import { call, put, fork } from 'redux-saga/effects';
import { detectUPnPDevices } from '../../../lib/upnp'
import { zeroConfScan } from '../../../lib/zeroconf'
import { ScanIps } from '../../../lib/portScanner'
import { networkPromise } from '../../../lib/helpers'
import { zservicesScan } from '../../../lib/zeroconf'
import * as actions from '../../actions/discovery'

function* ipScanner(action){
    yield call(ScanIps, action.dispatch, actions, action.config.ipScan)
}

function* upnpScan(action) {
    yield call(detectUPnPDevices, action.dispatch, actions)
} 

function* zconfScan(action){
    yield call(zeroConfScan, action.dispatch, actions, action.config.zeroConf)
}

function* runTasks(action){
    yield fork(upnpScan, action)
    yield fork(zconfScan, action)
    yield fork(ipScanner, action)
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
                services: values?.zeroConf?.services?.length? values.zeroConf.services : zeroConfServices
            }
        }
        yield put(actions.setDiscoveryConfig(null, config))        
    } catch (error) {
        console.log(error)
    }
}
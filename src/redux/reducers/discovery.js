import createReducer from '../../lib/createReducer';
import * as types from '../types/discovery';
import * as _ from 'lodash'

/* App Reducer
 * handles state in the App Container
 */

const initialState = {
    discovered: false,
    scan: false,
    old: [],
    last: {},
    config: {}
};

export const discoveryReducer = createReducer(initialState, {
    [types.START_DISCOVERY](state, action) {
        
        let newState = {
            scan: true,
            old: [...state.old],
            last: {
                    config: action.config,
                    execution: Date.now(),
                    time: {
                        start: {},
                        end: {}
                    },
                    discovered: [],
                    error: {},
                    termination: null
            }
        }

        return newState
    },
    [types.SET_START_DISCOVERY_TIME](state, action) {
        if(!state.scan){
            return state
        }
        return {...state, last: {...state.last, time: { ... state.last.time, start: { ...state.last.time.start, [action.protocol]: Date.now() }}}}
    },
    [types.SET_END_DISCOVERY_TIME](state, action) {
        if(!state.scan){
            return state
        }
        return {...state, last: {...state.last, time: { ... state.last.time, end: { ...state.last.time.end, [action.protocol]: Date.now() }}}}
    },
    [types.DEVICE_DISCOVERED](state, action) {
        if(!state.scan) {
            return state
        }

        let newState = { ...state }
        newState.last.discovered.push(action.info)
        return newState
    },
    [types.ERROR_DISCOVERY](state, action) {
        if(!state.scan){
            return state
        }
        return {...state, last: {...state.last, error: { ... state.last.error, [action.protocol]: action.error?.message}}}
    },
    [types.END_DISCOVERY](state, action) {
        if(!state.scan) {
            return state
        }

        const lastDiscovery = {
            ...state.last,
            termination: Date.now()
        }

        let newState = {
            ...state,
            scan: false,
            last: lastDiscovery
        }

        newState.old.push(lastDiscovery)


        return newState
    },
    [types.SET_DISCOVERY_CONFIG](state, action) {
        const { config, ...rest } = state
        let newState = {...rest} 
        if(action.protocol){
            newState.config = {...config, [action.protocol]: { ...action.config }}
        } else {
            newState.config = action.config
        }
        return newState
    },
    // [types.TERMINATE_SCAN](state, action) {
    //     return {...state, scan: false }
    // },
});

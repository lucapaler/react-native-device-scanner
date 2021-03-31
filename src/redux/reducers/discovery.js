import createReducer from '../../lib/createReducer';
import * as types from '../types/discovery';
import _ from 'lodash';

/* App Reducer
 * handles state in the App Container
 */

const initialState = {
    discovered: false,
    scan: false,
    old: [],
    last: {}
};

export const discoveryReducer = createReducer(initialState, {
    [types.START_DISCOVERY](state, action) {
        
        let newState = {
            scan: true,
            old: [...state.old],
            last: {
                    execution: Date.now(),
                    time: {
                        start: {},
                        end: {}
                    },
                    discovered: [],
                    zservices: [],
                    error: {},
                    termination: null
            }
        }

        if(Object.keys(state.last).length){
            newState.old.push(state.last)
        }

        return newState
    },
    [types.SET_START_DISCOVERY_TIME](state, action) {
        return {...state, last: {...state.last, time: { ... state.last.time, start: { ...state.last.time.start, [action.protocol]: Date.now() }}}}
    },
    [types.SET_END_DISCOVERY_TIME](state, action) {
        return {...state, last: {...state.last, time: { ... state.last.time, end: { ...state.last.time.end, [action.protocol]: Date.now() }}}}
    },
    [types.DEVICE_DISCOVERED](state, action) {
        let newState = { ...state }
        newState.last.discovered.push(action.info)
        return newState
    },
    [types.ZSERVICE_DISCOVERED](state, action) {
        let newState = { ...state };

        newState.last.zservices.push(action.info);

        return newState;
    },
    [types.ERROR_DISCOVERY](state, action) {
        return {...state, last: {...state.last, error: { ... state.last.error, [action.protocol]: action.error?.message}}}
    },
    [types.END_DISCOVERY](state, action) {
        return {...state, scan: false, last: { ...state.last, termination: Date.now()}}
    },
});

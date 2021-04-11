import createReducer from '../../lib/createReducer';
import * as types from '../types/account';
import * as _ from 'lodash'

/* App Reducer
 * handles state in the App Container
 */

const initialState = {
    loggedIn: false
};

export const accountReducer = createReducer(initialState, {
    [types.LOGIN_SUCCESS](state, action) {
        return { ...state, loggedIn: true }
    },
});

import { all } from 'redux-saga/effects';
import { discoverySagas } from './discovery'


/**
 *  Redux saga class init
 *  Import all sagas here
 */

export default function* rootSaga() {
    yield all([...discoverySagas]);
}

import { all } from 'redux-saga/effects';
import discoverySagas from './discovery';
import profileSagas from './profile';

export default function* rootSaga() {
  yield all([...discoverySagas, ...profileSagas]);
}

import { call, put } from 'redux-saga/effects';

import { apiFetch } from '../../../lib/helpers';
import {
  fetchProfileSuccess, fetchProfileFailure, createProfileSuccess, createProfileFailure,
  updateProfileFailure, updateProfileSuccess,
} from '../../actions/profile';

export function* fetchProfile({ pid }) {
  try {
    const response = yield call(apiFetch, {
      method: 'GET',
      endpoint: `profile/single/${pid}`,
    });

    yield put(fetchProfileSuccess(response.data.posted));
  } catch (error) {
    yield put(fetchProfileFailure(error));
  }
}

export function* createProfile({ pid }) {
  try {
    const response = yield call(apiFetch, {
      method: 'POST',
      endpoint: 'profile/single/scans',
      body: {
        pid,
        type: 'scans',
      },
    });

    yield put(createProfileSuccess(response.data.posted));
  } catch (error) {
    yield put(createProfileFailure(error));
  }
}

export function* updateProfile({ pid, token }) {
  try {
    const response = yield call(apiFetch, {
      method: 'PATCH',
      endpoint: `profile/single/${pid}`,
      body: {
        token,
        type: 'scans',
      },
    });

    yield put(updateProfileSuccess(response.data.patched));
  } catch (error) {
    yield put(updateProfileFailure(error));
  }
}

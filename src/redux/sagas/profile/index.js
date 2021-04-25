import { takeLatest } from 'redux-saga/effects';
import { FETCH_PROFILE, CREATE_PROFILE, UPDATE_PROFILE } from '../../types/profile';
import { fetchProfile, createProfile, updateProfile } from './saga';

export default [
  takeLatest(FETCH_PROFILE, fetchProfile),
  takeLatest(CREATE_PROFILE, createProfile),
  takeLatest(UPDATE_PROFILE, updateProfile),
];

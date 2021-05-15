import {
  FETCH_PROFILE, FETCH_PROFILE_SUCCESS, FETCH_PROFILE_FAILURE, CREATE_PROFILE,
  CREATE_PROFILE_SUCCESS, CREATE_PROFILE_FAILURE, UPDATE_PROFILE, UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAILURE,
} from '../types/profile';

export function fetchProfile(pid) {
  return {
    type: FETCH_PROFILE,
    pid,
  };
}

export function fetchProfileSuccess(data) {
  return {
    type: FETCH_PROFILE_SUCCESS,
    data,
  };
}

export function fetchProfileFailure(error) {
  return {
    type: FETCH_PROFILE_FAILURE,
    error,
  };
}

export function createProfile(pid) {
  return {
    type: CREATE_PROFILE,
    pid,
  };
}

export function createProfileSuccess(data) {
  return {
    type: CREATE_PROFILE_SUCCESS,
    data,
  };
}

export function createProfileFailure(error) {
  return {
    type: CREATE_PROFILE_FAILURE,
    error,
  };
}

export function updateProfile(pid, token) {
  return {
    type: UPDATE_PROFILE,
    pid,
    token,
  };
}

export function updateProfileSuccess(data) {
  return {
    type: UPDATE_PROFILE_SUCCESS,
    data,
  };
}

export function updateProfileFailure(error) {
  return {
    type: UPDATE_PROFILE_FAILURE,
    error,
  };
}

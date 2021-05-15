import {
  FETCH_PROFILE, FETCH_PROFILE_SUCCESS, FETCH_PROFILE_FAILURE, CREATE_PROFILE,
  CREATE_PROFILE_SUCCESS, CREATE_PROFILE_FAILURE, UPDATE_PROFILE, UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAILURE,
} from '../types/profile';
import initialState from '../store/initialState';

export default function profileReducer(state = initialState.profile, action = {}) {
  switch (action.type) {
    case FETCH_PROFILE:
      return {
        ...state,
        error: null,
      };

    case FETCH_PROFILE_SUCCESS:
      return {
        ...state,
        ...action.data,
      };

    case FETCH_PROFILE_FAILURE:
      return {
        ...state,
        error: action.error,
      };

    case CREATE_PROFILE:
      return {
        ...state,
        error: null,
      };

    case CREATE_PROFILE_SUCCESS:
      return {
        ...state,
        ...action.data,
        error: null,
      };

    case CREATE_PROFILE_FAILURE:
      return {
        ...state,
        error: action.error,
      };

    case UPDATE_PROFILE:
      return {
        ...state,
        error: null,
      };

    case UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        ...action.data,
      };

    case UPDATE_PROFILE_FAILURE:
      return {
        ...state,
        error: action.error,
      };

    default:
      return state;
  }
}

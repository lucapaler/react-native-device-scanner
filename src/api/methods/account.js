import { getMacAddress } from 'react-native-device-info';

import Api from '..';
import { apiFetch } from '../../lib/helpers';
import { ApiURLConstants } from '../ApiConstants';

export async function getUserProfile() {
  return apiFetch({
    method: 'GET',
    endpoint: `profile/single/${(await getMacAddress()).toLowerCase()}`,
  })
    .catch((error) => ({ error: true, ...error.response }));
}

export async function updateUserProfile(token) {
  try {
    const pid = await getMacAddress();
    const response = await Api.patchAuth(ApiURLConstants.PROFILE.SINGLE + pid.toLowerCase(), { token, type: 'scans' });
    return response;
  } catch (error) {
    return { error: true, ...error.response };
  }
}

export async function registerUser() {
  try {
    const pid = await getMacAddress();
    const response = await Api.postAuth(ApiURLConstants.PROFILE.SCAN, { id: pid.toLowerCase(), type: 'scans' });
    return response;
  } catch (error) {
    return { error: true, ...error.response };
  }
}

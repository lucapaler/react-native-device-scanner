import Api from '..';
import { ApiURLConstants } from '../ApiConstants';
import { getMacAddress } from 'react-native-device-info';

export async function getUserProfile() {
    try {
        const pid = await getMacAddress()
        const response = await Api.getAuth(ApiURLConstants.PROFILE.SINGLE + pid.toLowerCase())
        return response
    } catch (error) {
        return { error: true, ...error.response }
    }
}

export async function updateUserProfile(token) {
    try {
        const pid = await getMacAddress()
        const response = await Api.patchAuth(ApiURLConstants.PROFILE.SINGLE + pid.toLowerCase(), { token, type: "scans" })
        return response
    } catch (error) {
        return { error: true, ...error.response }
    }
}

export async function registerUser() {
    try {
        const pid = await getMacAddress()
        const response = await Api.postAuth(ApiURLConstants.PROFILE.SCAN, { id: pid.toLowerCase(), type: "scans" })
        return response
    } catch (error) {
        return { error: true, ...error.response }
    }
}
import Api from '..';
import { ApiURLConstants } from '../ApiConstants';

export async function testApi() {
    try {
        const response = await Api.getAuth(ApiURLConstants.SCANS.SCAN)
        console.log(response)
        // return { status: response.status, data: response.data }
    } catch (error) {
        console.log(error)
        // return { status: error.response.data.error.code, data: error.response.data.error.details }
    }
}
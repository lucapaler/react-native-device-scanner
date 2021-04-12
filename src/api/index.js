import _ from 'lodash';
import axios from 'axios';
import {ApiBaseConstants} from './ApiConstants';
import { getToken } from '../lib/firebase/helpers'

const Api = {
    get(path, options) {
        const url = ApiBaseConstants.BASE_URL + path
        return axios.get(url, options);
    },

    getAuth: async function (path, options) {
        try {
            const url = ApiBaseConstants.BASE_URL + path
            const token = await getToken()
            const config = {
                method: 'GET',
                headers: {
                    "accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                url,
                ...options
            }
            console.log(config)
            return axios(config)
        } catch (error) {
            throw error
        }
    },

    patchAuth: async function (path, data, options) {
        try {
            const url = ApiBaseConstants.BASE_URL + path
            const token = await getToken()
            const config = {
                method: 'PATCH',
                headers: {
                    "accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(data),
                url,
                ...options
            }
            // console.log(config)
            return axios(config)
        } catch (error) {
            throw error
        }
    },

    postAuth: async function (path, data, options) {
        try {
            const url = ApiBaseConstants.BASE_URL + path
            const token = await getToken()
            const config = {
                method: 'POST',
                headers: {
                    "accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(data),
                url,
                ...options
            }
            console.log(config)
            return axios(config)
        } catch (error) {
            throw error
        }
    },
    put: async function (path, data, options) {
        try {
            const url = ApiBaseConstants.BASE_URL + path
            const token = await getToken()
            const config = {
                method: 'PUT',
                headers: {
                    "accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(data),
                url,
                ...options
            }
            return axios(config)
        } catch (error) {
            throw error
        }
    }
};

export default Api;

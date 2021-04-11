// import Api from '..';
// import { ApiURLConstants } from '../ApiConstants';

// export async function registerGeneral(params) {
//   try {
//     const response = await Api.postAuth(ApiURLConstants.USER.USER, { user: { ...params }, role: 'user' })
//     return { status: response.status, data: response.data }
//   } catch (error) {
//     console.log(error)
//     return { status: error.response.data.error.code, data: error.response.data.error.details }
//   }
// }

// export async function registerFinlancer(params) {
//   try {
//     const response = await Api.postAuth(ApiURLConstants.USER.USER, { finlancer: { ...params, submittedAt: new Date() }, role: 'finlancer' })
//     return { status: response.status, data: response.data }
//   } catch (error) {
//     return { status: error.response.data.error.code, data: error.response.data.error.details }
//   }
// }

// export async function registerClient(params) {
//   try {
//     const response = await Api.postAuth(ApiURLConstants.USER.USER, { client: { ...params }, role: 'client' })
//     return { status: response.status, data: response.data }
//   } catch (error) {
//     return { status: error.response.data.error.code, data: error.response.data.error.details }
//   }
// }


// export async function getSelfInfo(query) {
//   try {
//     const response = await Api.getAuth(ApiURLConstants.USER.SELF + `?finlancerInfo=${query.finlancerInfo}&clientInfo=${query.clientInfo}`)
//     return { status: response.status, data: response.data }
//   } catch (error) {
//     console.log(error)

//     return { status: error.response.data.error.code, data: error.response.data.error.details }
//   }
// }

// export async function updateSelfInfo(params) {
//   console.log(params)
//   try {
//     const response = await Api.patchAuth(ApiURLConstants.USER.SELF, params)
//     return { status: response.status, data: response.data }
//   } catch (error) {
//     console.log(error)
//     return { status: error.response.data.error.code, data: error.response.data.error.details }
//   }
// }

// export async function getUserInfo(params) {
//   let query = ''
//   const keys = Object.keys(params)
//   for (const key of keys) {
//     if (key === 'limit') continue
//     if (['userId', 'username'].includes(key)) {
//       let q = ''
//       for (const st of params[key]) {
//         q += `&${key}=${st}`
//       }
//       query += q
//     } else {
//       query += `&${key}=${params[key]}`
//     }
//   }
//   try {
//     const response = await Api.getAuth(ApiURLConstants.USER.USER + `?limit=${params.limit}` + query)
//     return { status: response.status, data: response.data }
//   } catch (error) {
//     console.log(error)

//     return { status: error.response.data.error.code, data: error.response.data.error.details }
//   }
// }

// export async function getFinlancers(params, cancelToken) {
//   let query = ''
//   const keys = Object.keys(params)
//   for (const key of keys) {
//     if (key === 'limit') continue
//     if (['userId', 'username'].includes(key)) {
//       let q = ''
//       for (const st of params[key]) {
//         q += `&${key}=${st}`
//       }
//       query += q
//     } else {
//       query += `&${key}=${params[key]}`
//     }
//   }
//   try {
//     const response = await Api.getAuth(ApiURLConstants.USER.FINLANCER.FINLANCER + `?limit=${params.limit}` + query, {cancelToken: cancelToken})
//     console.log(response.data)
//     return { status: response.status, data: response.data }
//   } catch (error) {
//     console.log(error)

//     return { status: error.response.data.error.code, data: error.response.data.error.details }
//   }
// }

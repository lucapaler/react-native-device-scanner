// import Api from '..';
// import { ApiURLConstants } from '../ApiConstants';

// export async function getCategories(params) {
//     try {
//         let query = ''
//         const keys = Object.keys(params)
//         for (const key of keys){
//           if(key==='limit') continue
//           if(key==="categoryId"){
//             let q = ''
//             for (const st of params[key]){
//               q += `&${key}=${st}`
//             }
//             query += q
//           } else {
//             query += `&${key}=${params[key]}`
//           }
//         }
//       const response = await Api.getAuth(ApiURLConstants.JOB.CATEGORY + `?limit=${params.limit}` + query )
//       return { status: response.status, data: response.data }
//     } catch (error) {
//       console.log(error)
//       return { status: error.response.data.error.code, data: error.response.data.error.details }
//     }
// }

// export async function getSubCategories(params) {
//   try {
//       let query = ''
//       const keys = Object.keys(params)
//       for (const key of keys){
//         if(key==='limit') continue
//         if(key==="subCategoryId"){
//           let q = ''
//           for (const st of params[key]){
//             q += `&${key}=${st}`
//           }
//           query += q
//         } else {
//           query += `&${key}=${params[key]}`
//         }
//       }
//       console.log(query)
//     const response = await Api.getAuth(ApiURLConstants.JOB.SUBCATEGORY + `?limit=${params.limit}` + query )
//     return { status: response.status, data: response.data }
//   } catch (error) {
//     console.log(error)
//     return { status: error.response.data.error.code, data: error.response.data.error.details }
//   }
// }

// export async function getFinCategories(params) {
//   try {
//       let query = ''
//       const keys = Object.keys(params)
//       for (const key of keys){
//         if(key==='limit') continue
//         if(key==="categoryId"){
//           let q = ''
//           for (const st of params[key]){
//             q += `&${key}=${st}`
//           }
//           query += q
//         } else {
//           query += `&${key}=${params[key]}`
//         }
//       }
//     const response = await Api.getAuth(ApiURLConstants.USER.FINLANCER.CATEGORY + `?limit=${params.limit}` + query )
//     return { status: response.status, data: response.data }
//   } catch (error) {
//     console.log(error)
//     return { status: error.response.data.error.code, data: error.response.data.error.details }
//   }
// }

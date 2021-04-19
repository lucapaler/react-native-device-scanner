/* App config for apis */

export const ApiBaseConstants = {
  BASE_URL: 'https://v2-0-39-dot-watutors-1.uc.r.appspot.com/v2',
  PROFILE: {
    BASE: '/profile',
  },
  SCANS: {
    BASE: '/scans'
  }
}


export const ApiURLConstants = {
  PROFILE: {
    SINGLE: ApiBaseConstants.PROFILE.BASE + '/single/',
    SCAN: ApiBaseConstants.PROFILE.BASE + '/single/scans/',
  },
  SCANS: {
    SCAN: ApiBaseConstants.SCANS.BASE + '/scan',
  }
};

// export const ApiBaseConstants = {
//   BASE_URL: 'https://v2-0-39-dot-watutors-1.uc.r.appspot.com/v2',
//   PROFILE: {
//     BASE: '/profile',
//   },
//   // SCANS: {
//   //   BASE: '/scans/0.1'
//   // },
//   // ADMIN: {
//   //   BASE: '/admin/0.1'
//   // }
// }


// export const ApiURLConstants = {
//   USER: {
//     USER: ApiBaseConstants.USER.BASE + '/user',
//     SELF: ApiBaseConstants.USER.BASE + '/self',
//   },
//   SCANS: {
//     LOGS: ApiBaseConstants.SCANS.BASE + '/logs',
//     SCAN: ApiBaseConstants.SCANS.BASE + '/scan',
//     STATUS: ApiBaseConstants.SCANS.BASE + '/status',
//     CONFIG: ApiBaseConstants.SCANS.BASE + '/config',
//   },
//   ADMIN: {
//     CONFIG: {
//       BASE: ApiBaseConstants.ADMIN.BASE + '/config',
//       REQUEST: ApiBaseConstants.ADMIN.BASE + '/config/request'
//     },
//     LOGS: ApiBaseConstants.ADMIN.BASE + '/logs',
//     USER: ApiBaseConstants.ADMIN.BASE + '/user',
//     SCAN: {
//       REQUEST: ApiBaseConstants.ADMIN.BASE + '/scan/request',
//       STATUS: ApiBaseConstants.ADMIN.BASE + '/scan/status',
//     }
//   }
// };



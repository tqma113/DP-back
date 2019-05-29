import query from './mysql/index';

const createUserReports = (userId, reports) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `user_report` (`user_id`, `report_user_id`, `reason`) VALUES '
  sql += reports.map(item => {
    return '(' + userId + ', ' + item.userId + ', ' + item.reason + ')'
  }).join(', ') + ';'
  query({
    sql,
    values: []
  })
  .then((res) => {
    resolve(res)
  })
  .catch((err) => {
    reject(err)
  });
})

const selectUserReportsByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `user_report` WHERE `user_id` = ?',
    values: [user_id]
  })
  .then((res) => {
    if(res) {
      resolve(res)
    } else {
      reject({
        success: false,
        err: 'query result is empty'
      })
    }
  })
  .catch((err) => {
    reject(err)
  });
});

const selectUserReportsById = (id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `user_report` WHERE `id` = ?',
    values: [id]
  })
  .then((res) => {
    if(res) {
      resolve(res)
    } else {
      reject({
        success: false,
        err: 'query result is empty'
      })
    }
  })
  .catch((err) => {
    reject(err)
  });
});

const selectUserReportsByUserIds = (idList) => new Promise((resolve, reject) => {
  let sql = 'SELECT * FROM `user_report` WHERE `user_id` IN '
  sql += '(' + idList.join(', ') + ')'
  query({
    sql,
    values: []
  })
  .then((res) => {
    if(res) {
      resolve(res)
    } else {
      reject({
        success: false,
        err: 'query result is empty'
      })
    }
  })
  .catch((err) => {
    reject(err)
  });
});

const selectUserReportsByReportedUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `user_report` WHERE `report_user_id` = ?',
    values: [user_id]
  })
  .then((res) => {
    if(res) {
      resolve(res)
    } else {
      reject({
        success: false,
        err: 'query result is empty'
      })
    }
  })
  .catch((err) => {
    reject(err)
  });
});

const selectUserReportsByReportedUserIds = (idList) => new Promise((resolve, reject) => {
  let sql = 'SELECT * FROM `user_report` WHERE `report_user_id` IN '
  sql += '(' + idList.join(', ') + ')'
  query({
    sql,
    values: []
  })
  .then((res) => {
    if(res) {
      resolve(res)
    } else {
      reject({
        success: false,
        err: 'query result is empty'
      })
    }
  })
  .catch((err) => {
    reject(err)
  });
});

const deleteUserReport= (id) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `user_report` WHERE `id` = ?',
    values: [id]
  })
  .then((res) => {
    if(res) {
      resolve(res)
    } else {
      reject({
        success: false,
        err: 'query result is empty'
      })
    }
  })
  .catch((err) => {
    reject(err)
  });
});

const deleteUserReportsByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `user_report` WHERE `user_id` = ?',
    values: [user_id]
  })
  .then((res) => {
    if(res) {
      resolve(res)
    } else {
      reject({
        success: false,
        err: 'query result is empty'
      })
    }
  })
  .catch((err) => {
    reject(err)
  });
});

const updateUserReportsStatus = (id, status) => new Promise((resolve, reject) => {
  query({
    sql: 'UPDATE `user_report` SET `status` = ? WHERE (`id` = ?)',
    values: [status, id]
  })
  .then((res) => {
    if(res) {
      resolve(res)
    } else {
      reject({
        success: false,
        err: 'query result is empty'
      })
    }
  })
  .catch((err) => {
    reject(err)
  });
});

export default {
  createUserReports,
  selectUserReportsByUserId,
  selectUserReportsByUserIds,
  deleteUserReport,
  selectUserReportsByReportedUserId,
  selectUserReportsByReportedUserIds,
  deleteUserReportsByUserId,
  selectUserReportsById,
  updateUserReportsStatus
}
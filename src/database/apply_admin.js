import query from './mysql/index';

const createApplyAdmins = (user_id, reasons) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `apply_admin` (`user_id`, `reason`) VALUES '
  sql += reasons.map(item => {
    return '(' + user_id + ', ' + item + ')'
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

const selectApplyAdminsById = (id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `apply_admin` WHERE `id` = ?',
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

const selectApplyAdminsByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `apply_admin` WHERE `user_id` = ?',
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

const selectApplyAdminsByDealUserId = (deal_user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `apply_admin` WHERE `deal_user_id` = ?',
    values: [deal_user_id]
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

const deleteApplyAdminsByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `apply_admin` WHERE `user_id` = ?',
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

const selectApplyAdmins = () => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `apply_admin`',
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

const updateApplyAdmin = (id, key, value) => new Promise((resolve, reject) => {
  query({
    sql: 'UPDATE `apply_admin` SET `'+ key + '` = ? WHERE (`id` = ?)',
    values: [value, id]
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
  createApplyAdmins,
  selectApplyAdminsById,
  selectApplyAdminsByUserId,
  selectApplyAdminsByDealUserId,
  deleteApplyAdminsByUserId,
  selectApplyAdmins,
  updateApplyAdmin
}
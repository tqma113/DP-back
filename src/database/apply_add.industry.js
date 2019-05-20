import query from './mysql/index';

const createApplyAddIndustry = (user_id, industrys) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `apply_add_industry` (`user_id`, `name`, `description`, `image`) VALUES '
  sql += industrys.map(item => {
    return '(' + user_id + ', ' + item.name + ', ' + item.description + ', ' + item.image + ')'
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

const selectApplyAddIndustryById = (id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `apply_add_industry` WHERE `id` = ?',
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

const selectApplyAddIndustrysByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `apply_add_industry` WHERE `user_id` = ?',
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


const selectApplyAddIndustrysByDealUserId = (deal_user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `apply_add_industry` WHERE `deal_user_id` = ?',
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

const deleteApplyAddIndustrysByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `apply_add_industry` WHERE `user_id` = ?',
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

const selectApplyAddIndustrys = () => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `apply_add_industry`',
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

const updateApplyAddIndustry = (id, key, value) => new Promise((resolve, reject) => {
  query({
    sql: 'UPDATE `apply_add_industry` SET `'+ key + '` = ? WHERE (`id` = ?)',
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
  createApplyAddIndustry,
  selectApplyAddIndustryById,
  selectApplyAddIndustrysByUserId,
  selectApplyAddIndustrysByDealUserId,
  deleteApplyAddIndustrysByUserId,
  selectApplyAddIndustrys,
  updateApplyAddIndustry
}
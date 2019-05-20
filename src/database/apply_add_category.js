import query from './mysql/index';

const createAdminAddCategorys = (user_id, categorys) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `apply_add_category` (`user_id`, `subject`, `description`, `image`) VALUES '
  sql += categorys.map(item => {
    return '(' + user_id + ', ' + item.subject + ', ' + item.description + ', ' + item.image + ')'
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

const selectApplyAddCategorysById = (id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `apply_add_category` WHERE `id` = ?',
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

const selectApplyAddCategorysByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `apply_add_category` WHERE `user_id` = ?',
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

const selectApplyAddCategorysByDealUserId = (deal_user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `apply_add_category` WHERE `deal_user_id` = ?',
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

const deleteApplyAddCategorysByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `apply_add_category` WHERE `user_id` = ?',
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

const selectApplyAddCategorys = () => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `apply_add_category`',
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

const updateApplyAddCategory = (id, key, value) => new Promise((resolve, reject) => {
  query({
    sql: 'UPDATE `apply_add_category` SET `'+ key + '` = ? WHERE (`id` = ?)',
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
  createAdminAddCategorys,
  selectApplyAddCategorysById,
  selectApplyAddCategorysByUserId,
  selectApplyAddCategorysByDealUserId,
  deleteApplyAddCategorysByUserId,
  selectApplyAddCategorys,
  updateApplyAddCategory
}
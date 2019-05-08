import query from './mysql/index';

const createUserCategorys = (userId, categoryIds) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `user_category` (`user_id`, `category_id`) VALUES '
  sql += categoryIds.map(item => {
    return '(' + userId + ', ' + item + ')'
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

const selectUserCategorysByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `user_category` WHERE `user_id` = ?',
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

const selectUserCategorysByUserIds = (idList) => new Promise((resolve, reject) => {
  let sql = 'SELECT * FROM `user_category` VALUES `user_id` IN '
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

const selectUserCategorysByCategoryId = (category_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `user_category` WHERE `category_id` = ?',
    values: [category_id]
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

const selectUserCategorysByCategoryIds = (idList) => new Promise((resolve, reject) => {
  let sql = 'SELECT * FROM `user_category` WHERE `category_id` IN'
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

const deleteUserCategorys = (user_id, categoryId) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `user_category` WHERE `user_id` = ? AND `category_id` = ?',
    values: [user_id, categoryId]
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

const deleteUserCategorysByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `user_category` WHERE `user_id` = ?',
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

export default {
  createUserCategorys,
  selectUserCategorysByUserId,
  selectUserCategorysByCategoryId,
  deleteUserCategorys,
  selectUserCategorysByUserIds,
  selectUserCategorysByCategoryIds,
  deleteUserCategorysByUserId
}
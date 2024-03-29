import query from './mysql/index';

const createUserConcerneds = (userId, concernedUserIds) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `user_concerned` (`user_id`, `concerned_user_id`) VALUES '
  sql += concernedUserIds.map(item => {
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

const selectUserConcernedsByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `user_concerned` WHERE `user_id` = ?',
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

const selectUserConcernedsByConcernedUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `user_concerned` WHERE `concerned_user_id` = ?',
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

const deleteUserConcernedsByUserId = (user_id, concernedUserId) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `user_concerned` WHERE `user_id` = ?',
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

const deleteUserConcernedsByConcernedUserId = (concernedUserIds) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `user_concerned` WHERE `concerned_user_id` = ?',
    values: [concernedUserIds]
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

const deleteUserConcerned = (user_id, concernedUserIds) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `user_concerned` WHERE `user_id` = ? AND `concerned_user_id` = ?',
    values: [user_id, concernedUserIds]
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
  createUserConcerneds,
  selectUserConcernedsByUserId,
  selectUserConcernedsByConcernedUserId,
  deleteUserConcernedsByUserId,
  deleteUserConcernedsByConcernedUserId,
  deleteUserConcerned
}
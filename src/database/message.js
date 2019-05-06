import query from './mysql/index';

const createMessage = (userId, acceptUserId, content) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `message` (`s_user_id`, `a_user_id`, `content`) VALUES (?, ?, ?)'
  query({
    sql,
    values: [userId, acceptUserId, content]
  })
  .then((res) => {
    resolve(res)
  })
  .catch((err) => {
    reject(err)
  });
})

const selectMeesageById = (id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `message` WHERE `id` = ?',
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

const selectMeesageBySUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `message` WHERE `s_user_id` = ?',
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

const selectMessageByAUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `message` WHERE `a_user_id` = ?',
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


const selectMessageByASUserId = (a_user_id, s_user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `message` WHERE (`a_user_id` = ? AND `s_user_id` = ?) OR (`a_user_id` = ? AND `s_user_id` = ?)',
    values: [a_user_id, s_user_id, s_user_id, a_user_id]
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

const deleteMessage = (user_id, acceptUserId) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `message` WHERE (`s_user_id` = ? AND `a_user_id` = ?)',
    values: [user_id, acceptUserId]
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
  createMessage,
  selectMeesageById,
  selectMeesageBySUserId,
  selectMessageByAUserId,
  selectMessageByASUserId,
  deleteMessage
}
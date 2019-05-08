import query from './mysql/index';

const createSecQuestions = (userId, secQuestions) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `sec_question` (`user_id`, `question`, `answer`) VALUES '
  let allsql = secQuestions.map(item => {
    return sql + '(' + userId + ', ' + item.question + ', ' + item.answer + ')'
  }).join(', ') + ';'
  query({
    sql: allsql,
    values: []
  })
  .then((res) => {
    resolve(res)
  })
  .catch((err) => {
    reject(err)
  });
})

const selectSecQuestionByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `sec_question` WHERE `user_id` = ?',
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

const deleteUserSecQuestionByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `sec_question` WHERE `user_id` = ?',
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
  createSecQuestions,
  selectSecQuestionByUserId,
  deleteUserSecQuestionByUserId
}
import query from './mysql/index';

const createEduBGs = (userId, secQuestions) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `edu_background` (`user_id`, `school`, `major`, `degree`) VALUES '
  let allsql = secQuestions.map(item => {
    return sql + `('` + userId + `', '` + item.school + `', '` + item.major + `', '` + item.degree.toUpperCase() + `')`
  }).join(';')
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

const selectEduBGsByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `edu_background` WHERE `user_id` = ?',
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

const deleteEduBGsByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `edu_background` WHERE `user_id` = ?',
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
  createEduBGs,
  selectEduBGsByUserId,
  deleteEduBGsByUserId
}
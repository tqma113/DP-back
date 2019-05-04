import query from './mysql/index';

const createEmRecords = (userId, secQuestions) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `em_record` (`user_id`, `company`, `position`) VALUES '
  sql += secQuestions.map(item => {
    return '(' + userId + ', ' + item.company + ', ' + item.position + ')'
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

const selectEmRecordsByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `em_record` WHERE `user_id` = ?',
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

const deleteEmRecordsByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `em_record` WHERE `user_id` = ?',
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
  createEmRecords,
  selectEmRecordsByUserId,
  deleteEmRecordsByUserId
}
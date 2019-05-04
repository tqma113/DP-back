import query from './mysql/index';

const createUserIndustrys = (userId, industryIds) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `user_industry` (`user_id`, `industry_id`) VALUES '
  sql += industryIds.map(item => {
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

const selectUserIndustrysByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `user_industry` WHERE `user_id` = ?',
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

const selectUserIndustrysByIndustryId = (industry_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `user_industry` WHERE `industry_id` = ?',
    values: [industry_id]
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

const deleteUserIndustrysByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `user_industry` WHERE `user_id` = ?',
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
  createUserIndustrys,
  selectUserIndustrysByUserId,
  selectUserIndustrysByIndustryId,
  deleteUserIndustrysByUserId
}
import query from './mysql/index';

const createComment = (userId, content) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `comment` (`user_id`, `content`) VALUES (?, ?)'
  query({
    sql,
    values: [userId, content]
  })
  .then((res) => {
    resolve(res)
  })
  .catch((err) => {
    reject(err)
  });
})

const selectCommentsById = (idArr) => new Promise((resolve, reject) => {
  let sql = 'SELECT * FROM `comment`'
  if (idArr && idArr.length && idArr.length > 0) {
    sql += ' WHERE `id` in (' + idArr.map(i => `'${i}'`).join(', ') + ')'
  }
  query({
    sql
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
  selectCommentsById,
  createComment
}
import query from './mysql/index';

const createComComment = (cctId, commentId) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `com_comment` (`commented_comment_id`, `comment_id`) VALUES '
  sql += [commentId].map(item => {
    return '(' + cctId + ', ' + item + ')'
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

const selectComCommentByCommentId = (comment_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `com_comment` WHERE `comment_id` = ?',
    values: [comment_id]
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

const selectComCommentByCommentedId = (commented_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `com_comment` WHERE `commented_comment_id` = ?',
    values: [commented_id]
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
  createComComment,
  selectComCommentByCommentId,
  selectComCommentByCommentedId
}
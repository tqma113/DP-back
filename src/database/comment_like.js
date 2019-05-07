import query from './mysql/index';

const createCommentsLike = (userId, commentId) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `comment_like` (`user_id`, `comment_id`) VALUES '
  sql += [commentId].map(item => {
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

const selectCommentLikeByCommentId = (comment_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `comment_like` WHERE `comment_id` = ?',
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

const selectCommentLikeByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `comment_like` WHERE `user_id` = ?',
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

const deleteCommentslike = (userId, commentId) => new Promise((resolve, reject) => {
  let sql = 'DELETE FROM `comment_like` WHERE `user_id` = ? AND `comment_id` = ?'
  query({
    sql,
    values: [userId, commentId]
  })
  .then((res) => {
    resolve(res)
  })
  .catch((err) => {
    reject(err)
  });
})

export default {
  createCommentsLike,
  selectCommentLikeByCommentId,
  selectCommentLikeByUserId,
  deleteCommentslike
}
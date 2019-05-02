import query from './mysql/index';

const createArticleComments = (articleId, commentIds) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `article_comment` (`article_id`, `comment_id`) VALUES '
  sql += commentIds.map(item => {
    return '(' + articleId + ', ' + item + ')'
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

const selectArticleCommentsByArticleId = (article_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `article_comment` WHERE `article_id` = ?',
    values: [article_id]
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

const selectArticleCommentsByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `article_comment` WHERE `user_id` = ?',
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
  createArticleComments,
  selectArticleCommentsByArticleId,
  selectArticleCommentsByUserId
}
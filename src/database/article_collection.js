import query from './mysql/index';

const createArticleCollections = (articleId, userIds) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `article_collected` (`article_id`, `user_id`) VALUES '
  sql += userIds.map(item => {
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

const selectArticleCollectionsByArticleId = (article_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `article_collected` WHERE `article_id` = ?',
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

const selectArticleCollectionsByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `article_collected` WHERE `user_id` = ?',
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
  createArticleCollections,
  selectArticleCollectionsByArticleId,
  selectArticleCollectionsByUserId
}
import query from './mysql/index';

const createArticleCategorys = (articleId, categoryIds) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `article_category` (`article_id`, `category_id`) VALUES '
  sql += categoryIds.map(item => {
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

const selectArticleCategorysByUserId = (article_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `article_category` WHERE `article_id` = ?',
    values: [article_id]
  })
  .then((res) => {
    console.log(article_id,res)
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
  createArticleCategorys,
  selectArticleCategorysByUserId
}
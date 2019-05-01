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

export default {
  createArticleCategorys
}
import query from './mysql/index';

const createProjectLink = (articleId, links) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `article_like` (`article_id`, `link`) VALUES '
  sql += links.map(item => {
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

const selectProjectLinkByArticleId = (article_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `project_link` WHERE `article_id` = ?',
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

export default {
  createProjectLink,
  selectProjectLinkByArticleId
}
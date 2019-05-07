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

const selectArticleCategorysByArticleId = (article_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `article_category` WHERE `article_id` = ?',
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

const deleteArticleCategorysByArticleId = (article_id) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `article_category` WHERE `article_id` = ?',
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

const selectArticleCategorysByCategoryId = (category_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `article_category` WHERE `category_id` = ?',
    values: [category_id]
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


const selectArticleCategorysByCategoryIds = (idList) => new Promise((resolve, reject) => {
  let sql = 'SELECT * FROM `article_category` WHERE `category_id` IN'
  sql += '(' + idList.join(', ') + ')'
  query({
    sql,
    values: []
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
  createArticleCategorys,
  selectArticleCategorysByArticleId,
  selectArticleCategorysByCategoryId,
  selectArticleCategorysByCategoryIds,
  deleteArticleCategorysByArticleId
}
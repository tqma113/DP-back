import query from './mysql/index';

const createArticleIndustrys = (articleId, industryIds) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `article_industry` (`article_id`, `industry_id`) VALUES '
  sql += industryIds.map(item => {
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

const selectArticleIndustrysByArticleId = (article_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `article_industry` WHERE `article_id` = ?',
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

const deleteArticleIndustrysByArticleId = (article_id) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `article_industry` WHERE `article_id` = ?',
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

const selectArticleIndustrysByIndustryId = (industry_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `article_industry` WHERE `industry_id` = ?',
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


const selectArticleIndustrysByIndustryIds = (idList) => new Promise((resolve, reject) => {
  let sql = 'SELECT * FROM `article_industry` WHERE `industry_id` IN'
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
  createArticleIndustrys,
  selectArticleIndustrysByArticleId,
  selectArticleIndustrysByIndustryId,
  selectArticleIndustrysByIndustryIds,
  deleteArticleIndustrysByArticleId
}
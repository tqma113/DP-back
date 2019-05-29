import query from './mysql';

const createArticleReports = (userId, reports) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `article_report` (`user_id`, `article_id`, `reason`) VALUES '
  sql += reports.map(item => {
    return '(\'' + userId + '\', \'' + item.articleId + '\', \'' + item.reason + '\')'
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

const selectArticleReports = () => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `article_report`',
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

const selectArticleReportsByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `article_report` WHERE `user_id` = ?',
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

const selectArticleReportsByUserIds = (idList) => new Promise((resolve, reject) => {
  let sql = 'SELECT * FROM `article_report` WHERE `user_id` IN '
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

const selectArticleReportsByArticleId = (article_id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `article_report` WHERE `article_id` = ?',
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

const selectArticleReportsByIds = (idList) => new Promise((resolve, reject) => {
  let sql = 'SELECT * FROM `article_report` WHERE `article_id` IN '
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

const deleteArticleReport= (id) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `article_report` WHERE `id` = ?',
    values: [id]
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

const deleteArticleReportsByUserId = (user_id) => new Promise((resolve, reject) => {
  query({
    sql: 'DELETE FROM `article_report` WHERE `user_id` = ?',
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

const updateArticleReportsStatus = (id, status) => new Promise((resolve, reject) => {
  query({
    sql: 'UPDATE `article_report` SET `status` = ? WHERE (`id` = ?)',
    values: [status, id]
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
  createArticleReports,
  selectArticleReportsByUserId,
  selectArticleReportsByUserIds,
  deleteArticleReport,
  selectArticleReportsByIds,
  selectArticleReportsByArticleId,
  deleteArticleReportsByUserId,
  updateArticleReportsStatus,
  selectArticleReports
}
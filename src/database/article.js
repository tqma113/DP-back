import query from './mysql/index';

const selectArticle = () => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `article`'
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

const selectArticlesByIds = (idArr) => new Promise((resolve, reject) => {
  let sql = 'SELECT * FROM `article`'
  if (idArr && idArr.length && idArr.length > 0) {
    sql += ' WHERE `id` in (' + idArr.map(i => `'${i}'`).join(', ') + ')'
  }
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

const selectArticlesByUserIds = (idArr) => new Promise((resolve, reject) => {
  let sql = 'SELECT * FROM `article`'
  if (idArr && idArr.length && idArr.length > 0) {
    sql += ' WHERE `user_id` in (' + idArr.map(i => `'${i}'`).join(', ') + ')'
  }
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

const createArticle = (article) => new Promise((resolve, reject) => {
  query({
    sql: 'INSERT INTO `article` (`title`, `abstract`, `content`, `user_id`, `image`) VALUES (?, ?, ?, ?, ?)',
    values: [
      article.title,
      article.abstract,
      article.content,
      article.user_id,
      article.image
    ]
  })
  .then((res) => {
    selectArticlesByIds([res.insertId]).then((res) => {
      resolve(res[0])
    })
  })
  .catch((err) => {
    reject(err)
  });
})

const updateArticle = (article) => new Promise((resolve, reject) => {
  query({
    sql: 'UPDATE `article` SET `title`=?, `abstract`=?, `image`=?, `last_modify_time`=? WHERE `id`=?',
    values: [
      article.title,
      article.abstract,
      article.image,
      new Date(),
      article.id,
    ]
  })
  .then((res) => {
    selectArticlesByIds([article.id]).then((res) => {
      resolve(res[0])
    })
  })
  .catch((err) => {
    reject(err)
  });
})

const deleteArticleById = (id) => new Promise((resolve, reject) => {
  selectArticlesByIds([id]).then((res) => {
    if (res[0]) {
      const user = res[0];
      query({
        sql: 'DELETE FROM `article` WHERE `id` = ?',
        values: [id]
      })
      .then((res) => {
        resolve(user)
      })
    } 
  })
  .catch((err) => {
    reject(err && err.message ? err.message : err.toString())
  });
});

export default {
  selectArticle,
  selectArticlesByIds,
  selectArticlesByUserIds,
  createArticle,
  deleteArticleById,
  updateArticle
}
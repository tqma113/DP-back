import query from './mysql/index';

const selectCategory = () => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `category`'
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

const createCategorys = (categorys) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `category` (`subject`, `description`, `image`) VALUES '
  sql += categorys.map(item => {
    return '(' + item.subject + ', ' + item.description + ', ' + item.image + ')'
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
  selectCategory,
  createCategorys
}
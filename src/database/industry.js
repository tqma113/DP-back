import query from './mysql/index';

const selectIndustry = () => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `industry`'
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

const createIndustrys = (industrys) => new Promise((resolve, reject) => {
  let sql = 'INSERT INTO `industry` (`name`, `description`, `image`) VALUES '
  sql += industrys.map(item => {
    return '(' + item.name + ', ' + item.description + ', ' + item.image + ')'
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
  selectIndustry,
  createIndustrys
}
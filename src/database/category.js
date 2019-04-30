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


export default {
  selectCategory
}
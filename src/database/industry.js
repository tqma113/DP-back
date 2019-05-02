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

export default {
  selectIndustry
}
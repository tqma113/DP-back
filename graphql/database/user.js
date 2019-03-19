import query from './mysql/index';

const selectUserById = (id) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `user` WHERE `id` = ?',
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

const selectUsers = () => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `user`',
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

const insertUser = (user) => new Promise((resolve, reject) => {
  query({
    sql: 'INSERT INTO `user` (`name`, `address`) VALUES (?, ?)',
    values: [
        user.name,
        user.address
    ]
  })
  .then((res) => {
    selectUserById(res.insertId).then((res) => {
      resolve(res[0])
    })
  })
  .catch((err) => {
    console.log(err)
    reject(err)
  });
});

const deleteUserById = (id) => new Promise((resolve, reject) => {
  selectUserById(id).then((res) => {
    if (res[0]) {
      const user = res[0];
      query({
        sql: 'DELETE FROM `user` WHERE `id` = ?',
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

const updateUserById = (id, key, value) => new Promise((resolve, reject) => {
  query({
    sql: 'UPDATE `user` SET `'+ key + '` = ? WHERE (`id` = ?)',
    values: [value, id]
  })
  .then((res) => {
    selectUserById(id).then((res) => {
      resolve(res[0])
    })
  })
  .catch((err) => {
    reject(err && err.message ? err.message : err.toString())
  });
});

export default {
  selectUserById,
  insertUser,
  selectUsers,
  deleteUserById,
  updateUserById
};
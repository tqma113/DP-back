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

const selectUserByUsername = (username) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `user` WHERE `username` = ?',
    values: [username]
  })
  .then((res) => {
    resolve(res)
  })
  .catch((err) => {
    reject(err)
  });
});

const selectUserByEmail = (email) => new Promise((resolve, reject) => {
  query({
    sql: 'SELECT * FROM `user` WHERE `email` = ?',
    values: [email]
  })
  .then((res) => {
    resolve(res)
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

const createUser = (user) => new Promise((resolve, reject) => {
  query({
    sql: 'INSERT INTO `user` (`username`, `nickname`, `head_portrait`, `gender`, `location`, `birthday`,  `email`, `statement`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    values: [
      user.username,
      user.nickname,
      user.head_portrait,
      user.gender,
      user.location,
      user.birthday,
      user.email,
      user.statement
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
  selectUserByUsername,
  selectUserByEmail,
  createUser,
  selectUsers,
  deleteUserById,
  updateUserById
};
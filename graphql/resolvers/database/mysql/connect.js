const mysql = require('mysql');

const pool = mysql.createPool({
  host: 'blog.matianqi.com',
  user: 'root',
  password: 'mtq123',
  port: '3306',
  database: 'graphql',
  // charset: 'UTF8_GENERAL_CL',
  connectTimeout: 1000000,
  stringifyObjects: true,
  typeCast: true,
})

module.exports = async (sql) => new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      throw(err)
    }
    connection.query(sql, (err, results, field) => {
      connection.release()
      if (err)
        throw(err)
      else {
        resolve(results)
      }
    });
  })
});
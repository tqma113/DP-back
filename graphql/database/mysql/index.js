import pool from './pool';

export default async (sql) => new Promise((resolve, reject) => {
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
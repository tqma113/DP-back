import pool from './pool';

export default async (sql) => new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('error get connection:' + err.stack)
      return
    }
    
    connection.query(sql, (err, results, fields) => {
      connection.release()

      if (err) {
        console.error('error connection:' + err.stack)
        return
      }
      else {
        resolve(results)
      }
    });
  })
});
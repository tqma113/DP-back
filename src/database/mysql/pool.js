import mysql from 'mysql';

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

pool.on('acquire', function (connection) {
  console.log('[MySQL] Connection %d acquired', connection.threadId);
});

pool.on('connection', function (connection) {
  connection.query('SET SESSION auto_increment_increment=1')
  console.log('[MySQL] Connection %d connected!', connection.threadId)
});

console.log('[MySQL] Pool connected!')

export default pool
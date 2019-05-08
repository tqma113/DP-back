import mysql from 'mysql';

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'mtq123',
  port: '3306',
  database: 'dp_blog',
  charset : 'utf8mb4',
  connectTimeout: 1000000,
  stringifyObjects: true,
  typeCast: true,
  acquireTimeout: 1000000
})

pool.on('acquire', function (connection) {
  // console.log('[MySQL] Connection %d acquired', connection.threadId);
});

pool.on('connection', function (connection) {
  connection.query('SET SESSION auto_increment_increment=1')
  console.log('[MySQL] Connection %d connected!', connection.threadId)
});

console.log('[MySQL] Pool connected!')

export default pool
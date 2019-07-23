import mysql from 'mysql';

const configurations = {
  // Note: You may need sudo to run on port 443
  production: 'localhost',
  development: '47.90.81.55'
}

const environment = process.env.NODE_ENV || 'production'

const pool = mysql.createPool({
  host: configurations[environment],
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
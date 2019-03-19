import mysql from 'mysql';

export default mysql.createPool({
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

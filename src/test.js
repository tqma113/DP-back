import redis from './redis'
import CheckUsername from './key/check_username'
import jwt from './jwt'
// console.log(redis.set('aaa', {
//   code: 'bbb',
//   expira: 123123123}))
// setTimeout(() => console.log(redis.exists('aaa')), 1000)

// CheckUsername.create('aaa').then((key) => {
//   setTimeout(() => CheckUsername.check('aaa', key).then(a => console.log(a)), 30000)
// })

jwt.sign('aaaaaa').then(a => {
  console.log(a)
  jwt.verify('aaaaaa', a).then(a => console.log(a))
})
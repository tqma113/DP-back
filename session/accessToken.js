import redis from '../redis'

const REFRESH_TOKEN_TIME = 5*60*1000;

const createNewToken = () => {
  const all = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890'
  let token = 'AT_'

  for(let i = 0;i < 16;i++) {
    token += all[Math.random() * (all.length - 1)]
  }

  return token
}

export default {
  create: (username) => {
    let token = createNewToken();

    redis.set(username, {
      token,
      expira: (new Date()).getTime() + REFRESH_TOKEN_TIME
    })

    return token
  },
  refresh: (username) => {

  },
  delete: () => {

  }
}
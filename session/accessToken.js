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

const isAvailable = (sessionInfo) => sessionInfo.token &&
                          sessionInfo.expira &&
                          +sessionInfo.expira > (new Date().getTime())

const accessToken = {
  create: (username) => {
    const token = createNewToken();
    const sessionInfo = {
      token,
      expira: (new Date()).getTime() + REFRESH_TOKEN_TIME
    }

    redis.set(username, sessionInfo)

    return token
  },
  refresh: (username) => {
    this.delete(username)
    return this.create(username)
  },
  delete: (username) => {
    redis.delete(username)
  },
  check: (username, token) => {
    if (redis.exists(username)) {
      const sessionInfo = redis.get(username)
      return isAvailable(sessionInfo)
    } else {
      return false
    }
  },
  clear: (num) => {
    const check = (username, value) => {
      let arr = value.split('|')
      const sessionInfo = {
        token: arr[0],
        expira: +arr[1]
      }
      return isAvailable(sessionInfo)
    }

    const count = redis.clear(num, check)

    if (count > num/4) {
      clear(num)
    }
  }
}

export default accessToken
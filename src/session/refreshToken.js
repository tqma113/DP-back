import redis from '../redis'

const REFRESH_TOKEN_TIME = 20*60*1000;
const PREFIX = 'RT_'

const createNewToken = () => {
  const all = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890'
  let token = 'RT_'

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

    redis.set(PREFIX + username, sessionInfo)

    return token
  },
  refresh: (username) => {
    this.delete(username)
    return this.create(username)
  },
  delete: (username) => {
    redis.delete(PREFIX + username)
  },
  check: (username, token) => {
    if (redis.exists(PREFIX + username)) {
      const sessionInfo = redis.get(PREFIX + username)
      return isAvailable(sessionInfo) && sessionInfo.expira === token
    } else {
      return false
    }
  },
  clear: (num) => {
    const check = (value) => {
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
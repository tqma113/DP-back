import redis from '../redis'

const REFRESH_CODE_TIME = 3*60*1000;
const PREFIX = 'CODE_'

const createNewCode = () => {
  const all = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890'
  let code = ''

  for(let i = 0;i < 6;i++) {
    code += all[Math.random() * (all.length - 1)]
  }

  return code
}

const isAvailable = (varifyInfo) => varifyInfo.code &&
                          varifyInfo.expira &&
                          +varifyInfo.expira > (new Date().getTime())

const code = {
  create: (username) => {
    const code = createNewCode();
    const varifyInfo = {
      code,
      expira: (new Date()).getTime() + REFRESH_CODE_TIME
    }

    redis.set(PREFIX + username, varifyInfo)

    return code
  },
  refresh: (username) => {
    this.delete(username)
    return this.create(username)
  },
  delete: (username) => {
    redis.delete(PREFIX + username)
  },
  check: (username, code) => {
    if (redis.exists(PREFIX + username)) {
      const varifyInfo = redis.get(PREFIX + username)
      return isAvailable(varifyInfo) && varifyInfo.code === code
    } else {
      return false
    }
  },
  clear: (num) => {
    const check = (value) => {
      let arr = value.split('|')
      const varifyInfo = {
        code: arr[0],
        expira: +arr[1]
      }
      return isAvailable(varifyInfo)
    }

    const count = redis.clear(num, check)

    if (count > num/4) {
      clear(num)
    }
  }
}

export default accessToken
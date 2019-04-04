import redis from '../redis'

const REFRESH_CODE_TIME = 3*60*1000;
const PREFIX = 'CUKEY_'

const createNewCode = () => {
  const all = 'qwertyuiopasdfghjklzxcvbnm_1234567890'
  let code = ''

  for(let i = 0;i < 16;i++) {
    code += all[parseInt(Math.random() * (all.length - 1))]
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
  check: (username, key) => {
    if (redis.exists(PREFIX + username)) {
      const varifyInfo = redis.get(PREFIX + username)
      return isAvailable(varifyInfo) && varifyInfo.code === key
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
  },
  exists : (username) => {
    if (redis.exists(PREFIX + username)) {
      const varifyInfo = redis.get(PREFIX + username)
      return !!varifyInfo && varifyInfo.expira > (new Date().getTime())
    } else {
      return false
    }
  }
}

export default code
import redis from '../redis'

const REFRESH_CODE_TIME = 3*60*1000;
const PREFIX = 'EMAILCODE_'

const createNewCode = () => {
  const all = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890'
  let code = ''

  for(let i = 0;i < 6;i++) {
    code += all[parseInt(Math.random() * (all.length - 1))]
  }

  return code
}

const isAvailable = (varifyInfo) => varifyInfo && varifyInfo.code &&
                          varifyInfo.expira &&
                          +varifyInfo.expira > (new Date().getTime())

const code = {
  create: async (email) => {
    const code = createNewCode();
    const varifyInfo = {
      code,
      expira: (new Date()).getTime() + REFRESH_CODE_TIME
    }

    let isSuccess = await redis.set(PREFIX + email, varifyInfo)

    return isSuccess ? code : false
  },
  refresh: async (email) => {
    await this.delete(email)
    return await this.create(email)
  },
  delete: async (email) => {
    await redis.delete(PREFIX + email)
  },
  check: async (email, code) => {
    if (await redis.exists(PREFIX + email)) {
      const varifyInfo = await redis.get(PREFIX + email)
      await redis.delete(PREFIX + email)
      return isAvailable(varifyInfo) && varifyInfo.code === code
    } else {
      return false
    }
  },
  clear: async (num) => {
    const check = (value) => {
      let arr = value.split('|')
      const varifyInfo = {
        code: arr[0],
        expira: +arr[1]
      }
      return isAvailable(varifyInfo)
    }

    const count = await redis.clear(num, check)

    if (count > num/4) {
      clear(num)
    }
  }
}

export default code
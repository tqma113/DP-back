import redis from './index'

const isAvailable = (varifyInfo) => varifyInfo.code &&
                        varifyInfo.expira &&
                        +varifyInfo.expira > (new Date().getTime())

const clearRedis = (num) => {
  const check = (value) => {
    if (!value) return false
    
    let arr = value.split('|')
    const varifyInfo = {
      code: arr[0],
      expira: +arr[1]
    }
    return isAvailable(varifyInfo)
  }

  redis.clear(num, check).then((count) => {
    if (count > num/4) {
      clear(num)
    }
  })
}

setInterval(clearRedis, 1000*60*30, 50)
process.send('Redis clear started!')
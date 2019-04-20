import client from './connect';

const getAsync = (key) => {
  return ((new Promise((resolve, reject) => {
    client.get(key, (err, reply) => {
      if (err) {
        reject(false)
      }
      resolve(reply)
    })
  })).then(reply => reply).catch(err => false))
}

const setAsync = (key, value) => {
  return ((new Promise((resolve, reject) => {
    client.set(key, value, (err, reply) => {
      if (err) {
        reject(false)
      }
      resolve(true)
    })
  })).then(reply => reply).catch(err => false))
}

const delAsync = (key) => {
  return ((new Promise((resolve, reject) => {
    client.del(key, (err, reply) => {
      if (err) {
        reject(false)
      }
      resolve(true)
    })
  })).then(reply => reply).catch(err => false))
}

const existAsync = (key) => {
  return ((new Promise((resolve, reject) => {
    client.exists(key, (err, reply) => {
      if (err) {
        reject(false)
      }
      resolve(true)
    })
  })).then(reply => reply).catch(err => false))
}

const set = async (key, oValue) => {
  let isValid = typeof oValue == 'object' && 
              oValue.code && 
              oValue.expira
  if (isValid) {
    if (await client.exists(key)) {
      await client.del(key)
    }

    let value = `${oValue.code}|${oValue.expira}`
    return await setAsync(key, value)
  } else {
    return false
  }
}

const get = async (key) => {
  let value = await getAsync(key)
  if (!value) return value
  let arr = value.split('|')
  return {
    code: arr[0],
    expira: parseInt(arr[1])
  }
}

const exists = async (key) => {
  return await existAsync(key)
}

const deleteKey = async (key) => {
  return await delAsync(key)
}

const clear = async (num, check) => {
  let count = 0

  for (let i = 0;i < num; i++) {
    let key = client.RANDOMKEY(async (key) => {
      if (!key) return;

      let value = get(key)
      if (!check(value)) {
        await deleteKey(key)
        count++
      }
    })
  }

  return count
}

export default {
  set,
  get,
  exists,
  delete: deleteKey,
  clear
}
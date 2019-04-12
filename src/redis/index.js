import client from './connect';

const getAsync = (key) => {
  return ((new Promise((resolve, reject) => {
    client.get(key, (err, reply) => {
      if (err) {
        console.log(err)
      }
      resolve(reply)
    })
  })).then(reply => reply))
}

const set = (key, oValue) => {
  let isValid = typeof oValue == 'object' && 
              oValue.code && 
              oValue.expira
  if (isValid) {
    if (client.exists(key)) {
      client.delete(key)
    }

    let value = `${oValue.token}|${oValue.expira}`
    client.set(key, value)
    return true
  } else {
    return false
  }
}

const get = (key) => {
  let value = getAsync(key)
  if (!value) return value

  let arr = value.split('|')
  return {
    code: arr[0],
    expira: parseInt(arr[1])
  }
}

const exists = (key) => {
  return client.exists(key)
}

const deleteKey = (key) => {
  client.del(key)
}

const clear = (num, check) => {
  let count = 0

  for (let i = 0;i < num; i++) {
    let key = client.RANDOMKEY((key) => {
      if (!key) return;

      let value = get(key)
      if (!check(value)) {
        deleteKey(key)
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
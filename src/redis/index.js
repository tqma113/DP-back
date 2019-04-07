import client from './connect';

const getAsync = (key) => new Promise((resolve, reject) => {
  client.get(key, resolve)
})

const set = (key, oValue) => {
  if ((!client.exists(key)) && 
        typeof oValue == 'object' && 
        oValue.token && 
        oValue.expira) {
    let value = `${oValue.token}|${oValue.expira}`
    client.set(key, value)
    return true
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

const exists = (key) => {
  return client.exists(key)
}

const deleteKey = (key) => {
  client.del(key)
}

const clear = async (num, check) => {
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
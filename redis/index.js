import client from './connect';

const set = (key, value) => {
  if (!client.hexists(key)) {
    client.hset(key, value)
    return true
  } else {
    return false
  }
}

const get = (key) => {
  return client.hget(key)
}

const exists = (key) => {
  return client.hexists(key)
}

export default {
  set,
  get,
  exists
}

import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

import redis from '../redis'

const privateKey = fs.readFileSync(path.resolve(__dirname, './key/rsa_private_key.pem'));
const publicKey = fs.readFileSync(path.resolve(__dirname, './key/rsa_public.key'));

const REFRESH_CODE_TIME = 3*60*1000;
const PREFIX = 'JWTID_'

const createNewId = () => {
  const all = 'qwertyuiopasdfghjklzxcvbnm_1234567890'
  let code = ''

  for(let i = 0;i < 10;i++) {
    code += all[parseInt(Math.random() * (all.length - 1))]
  }

  return code
}

const sign = (username) => {
  let jwtId = createNewId()
  redis.set(PREFIX + username, jwtId)
  return jwt.sign({ username, jwtId }, privateKey, { algorithm: 'RS256', expiresIn: '7d' })
}

const verify = (token) => {
  let info = jwt.verify(token, publicKey, { algorithms: ['RS256'] })
  let jwtId = redis.get(info.username)

  if (info.jwtId !== jwtId) {
    return false
  }

  return info
}

const stale = (username) => {
  redis.delete(PREFIX + username)
}

export default {
  sign,
  verify,
  stale
}
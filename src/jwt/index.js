
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

import redis from '../redis'

const privateKey = fs.readFileSync(path.resolve(__dirname, './key/rsa_private_key.pem'));
const publicKey = fs.readFileSync(path.resolve(__dirname, './key/rsa_public.key'));

const JWT_CODE_TIME = 7*24*60*60*1000;
const PREFIX = 'JWTID_'

const createNewId = () => {
  const all = 'qwertyuiopasdfghjklzxcvbnm_1234567890'
  let code = ''

  for(let i = 0;i < 10;i++) {
    code += all[parseInt(Math.random() * (all.length - 1))]
  }

  return code
}

const signAsync = ({ username, jwtId }) => {
  return ((new Promise((resolve, reject) => {
    jwt.sign({ username, jwtId }, privateKey, { algorithm: 'RS256', expiresIn: '7d' }, (err, reply) => {
      if (err) {
        reject(false)
      }
      resolve(reply)
    })
  })).then(reply => reply).catch(err => false))
}

const verifyAsync = (token) => {
  return ((new Promise((resolve, reject) => {
    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, reply) => {
      if (err) {
        reject(false)
      }
      resolve(reply)
    })
  })).then(reply => reply).catch(err => false))
}

const sign = async (username) => {
  let jwtId = createNewId()
  const varifyInfo = {
    code: jwtId,
    expira: (new Date()).getTime() + JWT_CODE_TIME
  }
  let isSuccess = await redis.set(PREFIX + username, varifyInfo)
  return isSuccess && await signAsync({ username, jwtId })
}

const verify = async (username, token) => {
  let info = await verifyAsync(token)
  let varifyInfo = await redis.get(PREFIX + info.username)
  
  if (!info || !varifyInfo || info.jwtId !== varifyInfo.code || info.username !== username) {
    return false
  }
  info.token = token
  
  return info
}

const stale = async (username) => {
  return await redis.delete(PREFIX + username)
}

export default {
  sign,
  verify,
  stale
}
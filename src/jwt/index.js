
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

const privateKey = fs.readFileSync(path.resolve(__dirname, './key/rsa_private_key.pem'));
const publicKey = fs.readFileSync(path.resolve(__dirname, './key/rsa_public.key'));

const sign = (info) => {
  return jwt.sign(info, privateKey, { algorithm: 'RS256', expiresIn: '7d' })
}

const verify = (token) => {
  return jwt.verify(token, publicKey, { algorithms: ['RS256'] })
}

export default {
  sign,
  verify
}
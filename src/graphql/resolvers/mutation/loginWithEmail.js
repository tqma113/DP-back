import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const loginWithEmail = async (root, { email, code, key },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []
  let user = {}

  try {
    user = (await dataSources.database.user.selectUser({ email }, ['username']))[0]
    let isValidCode = await dataSources.Email.checkCode(email, code)
    let isValidKey = await dataSources.CheckEmailKey.check(email, key)
    let isValid = user && user.username && isValidCode && isValidKey

    if (isValid) {
      await dataSources.Email.deleteCode(email)
      await dataSources.CheckEmailKey.delete(email)

      let token = await dataSources.jwt.sign(user.username)

      response = {
        token,
        username: user.username,
        isSuccess: true,
        extension: {
          operator: 'login',
          errors
        }
      }
      let cookie = `customer=${user.username};username=${user.username};path=/;Expires=${moment().add(7, 'd').format('ddd, D MMM YYYY HH:mm:SS')} GMT;Secure;HttpOnly`
      res.setHeader('Set-Cookie', cookie)
    } else {
      if (!user || !user.username) {
        errors.push({
          path: 'login.email',
          message: 'email is not exist'
        })
      }

      if (!isValidKey) {
        errors.push({
          path: 'login.email',
          message: 'code is not right'
        })
      }

      if (!isValidCode) {
        errors.push({
          path: 'login.email',
          message: 'code is not right'
        })
      }

      response = {
        isSuccess: false,
        extension: {
          operator: 'login',
          errors
        }
      }
    }
  } catch (err) {
    errors.push({
      path: 'login',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: 'login',
        errors
      }
    }
  }
  
  return response
}

export default loginWithEmail
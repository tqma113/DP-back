import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const login = async (root, { username, password }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []
  let user = {}

  try {
    if (username.indexOf('@') !== -1) {
      user = (await dataSources.database.user.selectUser({ email: username }, ['password']))[0]
    } else {
      user = (await dataSources.database.user.selectUser({ username }, ['password']))[0]
    }

    let isValid = user && user.password && user.password === password

    if (isValid) {
      let token = await dataSources.jwt.sign(username)

      response = {
        token,
        username,
        isSuccess: true,
        extension: {
          operator: 'login',
          errors
        }
      }
      let cookie = `customer=${username};username=${username};path=/;Expires=${moment().add(7, 'd').format('ddd, D MMM YYYY HH:mm:SS')} GMT;Secure;HttpOnly`
      res.setHeader('Set-Cookie', cookie)
    } else {
      if (!user) {
        errors.push({
          path: 'login.username',
          message: 'username is not exist'
        })
      }
      
      if (user && user.password && user.password !== password) {
        errors.push({
          path: 'login.password',
          message: 'password is not right'
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
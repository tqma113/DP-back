import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const register = async (root, { username, nickname, avatar, gender, location, birthday, email, statement, u_key, e_key},  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let newUser = {
    username,
    nickname,
    avatar,
    gender,
    location,
    birthday,
    email,
    statement
  }

  let errors = []
  let response = {}

  try {
    let isValidUKey = await dataSources.CheckUsernameKey.check(username, u_key);
    let isValidEKey = await dataSources.Email.AckKey.check(email, e_key);
    let isValid = isValidEKey && isValidUKey

    if (isValid) {
      await dataSources.CheckUsernameKey.delete(username)
      await dataSources.Email.AckKey.delete(email)

      let user = await dataSources.database.user.createUser(newUser)
      let token = await dataSources.jwt.sign(username)
      
      response = {
        token,
        username: user.username,
        isSuccess: true,
        extension: {
          operator: 'register',
          errors
        }
      }
    } else {
      if (!isValidUKey) {
        errors.push({
          path: 'register.username_ack',
          message: 'username has not been ack'
        })
      }
  
      if (!isValidEKey) {
        errors.push({
          path: 'register.email_ack',
          message: 'email has not been ack'
        })
      }
      response = {
        isSuccess: false,
        extension: {
          operator: 'register',
          errors
        }
      }
    }
  }  catch (err) {
    errors.push({
      path: 'register',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: 'register',
        errors
      }
    }
  }

  return response
}

export default register
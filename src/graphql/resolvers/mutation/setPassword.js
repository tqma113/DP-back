import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const setPassword = async (root, { email, password, key },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let user = (await dataSources.database.user.selectUser({ email }, ['username']))[0]
    let isValidEKey = await dataSources.Email.AckKey.check(email, key);
    let isValid = user && isValidEKey

    if (isValid) {
      await dataSources.database.user.updateUserByEmail(email, 'password', password)
      response = {
        isSuccess: true,
        extension: {
          operator: 'setPassword',
          errors
        }
      }

      await dataSources.Email.AckKey.delete(email)
    } else {
      if (!user) {
        errors.push({
          path: 'setPassword',
          message: 'email is invalid'
        })
      }
      if (!isValidEKey) {
        errors.push({
          path: 'setPassword',
          message: 'ack key is invalid'
        })
      }
      response = {
        isSuccess: false,
        extension: {
          operator: 'setPassword',
          errors
        }
      }
    }
  } catch (err) {
    errors.push({
      path: 'setPassword',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: 'setPassword',
        errors
      }
    }
  }

  return response
}

export default setPassword
import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'


const pubsub = getPubSub()

const ackEmail = async (root, { email, code, key },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []
  try {
    let isValidCode = await dataSources.Email.checkCode(email, code)
    let isValidKey = await dataSources.CheckEmailKey.check(email, key)
    let isValid = isValidCode && isValidKey

    if (isValid) {
      await dataSources.Email.deleteCode(email)
      await dataSources.CheckEmailKey.delete(email)

      let key = await dataSources.Email.AckKey.create(email)
      response = {
        key: key,
        isSuccess: true,
        extension: {
          operator: "ack email code",
          errors
        }
      }
    } else {
      if (!isValidCode) {
        errors.push({
          path: 'ackEemail',
          message: 'code not valid'
        })
      }

      if (!isValidKey) {
        errors.push({
          path: 'ackEemail',
          message: 'key not valid'
        })
      }
      
      response = {
        key: '',
        isSuccess: false,
        extension: {
          operator: "ack email code",
          errors
        }
      }
    }
  } catch(err) {
    errors.push({
      path: 'ackEmail',
      message: JSON.stringify(err)
    })
    response = {
      key: '',
      isSuccess: false,
      extension: {
        operator: "check email if usable&&send email code",
        errors
      }
    }
  }

  return response
}

export default ackEmail
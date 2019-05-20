import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const sendEmailLoginCode = async (root, { email },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []
  try {
    let users = await dataSources.database.user.selectUserByEmail(email)
    let isValid = users.length > 0 && !(await dataSources.CheckEmailKey.exists(email))

    if (isValid) {
      let info = await dataSources.Email.sendCode(email)

      if (info) {
        let key = await dataSources.CheckEmailKey.create(email)
        response = {
          key,
          isSuccess: true,
          extension: {
            operator: "check email if usable&&send email code",
            errors
          }
        }
      } else {
        errors.psuh({
          path: 'sendEmailCode.check',
          message: 'send email faliure'
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
    } else {
      if (users.length <= 0) {
        errors.push({
          path: 'sendEmailLoginCode',
          message: 'email is not exist'
        })
      } else {
        errors.push({
          path: 'sendEmailLoginCode',
          message: 'email has been send'
        })
      }
      
      response = {
        key: '',
        isSuccess: false,
        extension: {
          operator: "send email login code",
          errors
        }
      }
    }
  } catch(err) {
    errors.push({
      path: 'sendEmailLoginCode',
      message: JSON.stringify(err)
    })
    response = {
      key: '',
      isSuccess: false,
      extension: {
        operator: "send email login code",
        errors
      }
    }
  }

  return response
}

export default sendEmailLoginCode
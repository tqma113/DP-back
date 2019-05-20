import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const sendEmailCode = async (root, { email },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []
  try {
    let users = await dataSources.database.user.selectUserByEmail(email)
    let isValid = users.length === 0 && !(await dataSources.CheckEmailKey.exists(email))

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
      errors.push({
        path: 'sendEmailCode.check',
        message: 'has been used'
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
  } catch(err) {
    errors.push({
      path: 'sendEmailCode',
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

export default sendEmailCode
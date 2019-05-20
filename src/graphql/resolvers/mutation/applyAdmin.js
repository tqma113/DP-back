import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const applyAdmin = async (root, { reason }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = currentUser && sessionInfo && reason

    if (isValid) {
      await dataSources.database.applyAdmin.createApplyAdmins(currentUser.id, [reason])

      response = {
        isSuccess: true,
        extension: {
          operator: 'applyAdmin',
          errors
        }
      }
    } else {
      if (!currentUser || !sessionInfo) {
        errors.push({
          path: 'applyAdmin',
          message: 'auth fail'
        })
      }

      if (!reason) {
        errors.push({
          path: 'applyAdmin',
          message: 'reason is null'
        })
      }
      

      response = {
        isSuccess: false,
        extension: {
          operator: 'applyAdmin',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'applyAdmin',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "applyAdmin",
        errors
      }
    }
  }
  
  return response
}

export default applyAdmin
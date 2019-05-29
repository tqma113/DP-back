import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const reportUser = async (root, { userId, reason },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = currentUser && sessionInfo
    if (isValid) {
      let userReport = {
        userId,
        reason
      }
      let report = await dataSources.database.userReport.createUserReports(currentUser.id, [userReport])
      response = {
        isSuccess: true,
        extension: {
          operator: "reportUser",
          errors
        }
      }
    } else {
      errors.push({
        path: 'reportUser',
        message: 'auth is invalid'
      })

      response = {
        isSuccess: false,
        extension: {
          operator: 'reportUser',
          errors
        }
      }
    }
  } catch (err) {
    errors.push({
      path: 'reportUser',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "reportUser",
        errors
      }
    }
  }

  return response
}

export default reportUser
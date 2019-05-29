import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const dealReportUser = async (root, { id, status },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = currentUser && sessionInfo && currentUser.user_type == 1
    if (isValid) {
      let report = (await dataSources.database.userReport.selectUserReportsById(id))[0]
      if (report && report.status == 0) {
        await dataSources.database.userReport.updateUserReportsStatus(id, Number(status))
        response = {
          isSuccess: true,
          extension: {
            operator: "dealReportUser",
            errors
          }
        }
      } else {
        errors.push({
          path: 'dealReportUser',
          message: 'you can\'t operate this report'
        })
  
        response = {
          isSuccess: false,
          extension: {
            operator: 'dealReportUser',
            errors
          }
        }
      }
    } else {
      errors.push({
        path: 'dealReportUser',
        message: 'auth is invalid'
      })

      response = {
        isSuccess: false,
        extension: {
          operator: 'dealReportUser',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'dealReportUser',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "dealReportUser",
        errors
      }
    }
  }

  return response
}

export default dealReportUser
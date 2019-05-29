import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const dealReportArticle = async (root, { id, status },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = currentUser && sessionInfo && currentUser.user_type == 1
    if (isValid) {
      let report = (await dataSources.database.articleReport.selectArticleReportsById(id))[0]
      if (report && report.status == 0) {
        await dataSources.database.articleReport.updateArticleReportsStatus(id, Number(status))
        response = {
          isSuccess: true,
          extension: {
            operator: "dealReportArticle",
            errors
          }
        }
      } else {
        errors.push({
          path: 'dealReportArticle',
          message: 'you can\'t operate this report'
        })
  
        response = {
          isSuccess: false,
          extension: {
            operator: 'dealReportArticle',
            errors
          }
        }
      }
    } else {
      errors.push({
        path: 'dealReportArticle',
        message: 'auth is invalid'
      })

      response = {
        isSuccess: false,
        extension: {
          operator: 'dealReportArticle',
          errors
        }
      }
    }
  } catch (err) {
    errors.push({
      path: 'dealReportArticle',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "dealReportArticle",
        errors
      }
    }
  }

  return response
}

export default dealReportArticle
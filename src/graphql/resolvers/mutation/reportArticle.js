import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const reportArticle = async (root, { articleId, reason },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = currentUser && sessionInfo
    if (isValid) {
      let articleReport = {
        articleId,
        reason
      }
      let report = await dataSources.database.articleReport.createArticleReports(currentUser.id, [articleReport])
      response = {
        isSuccess: true,
        extension: {
          operator: "reportArticle",
          errors
        }
      }
    } else {
      errors.push({
        path: 'reportArticle',
        message: 'auth is invalid'
      })

      response = {
        isSuccess: false,
        extension: {
          operator: 'reportArticle',
          errors
        }
      }
    }
  } catch (err) {
    errors.push({
      path: 'reportArticle',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "reportArticle",
        errors
      }
    }
  }

  return response
}

export default reportArticle
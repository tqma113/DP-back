import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const articleLike = async (root, {articleId, status = false },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = currentUser && sessionInfo

    if (isValid) {
      if (status) {
        await dataSources.database.articleLike.deleteArticleLikes(articleId, [currentUser.id])
      } else {
        await dataSources.database.articleLike.createArticleLikes(articleId, [currentUser.id])
      }
      
      response = {
        isSuccess: true,
        extension: {
          operator: 'article star',
          errors
        }
      }
    } else {
      errors.push({
        path: 'articleStar',
        message: 'auth fail'
      })

      response = {
        isSuccess: false,
        extension: {
          operator: 'articleLike',
          errors
        }
      }
    }
  } catch (err) {
    errors.push({
      path: 'articleStar',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "article star",
        errors
      }
    }
  }

  return response
}

export default articleLike
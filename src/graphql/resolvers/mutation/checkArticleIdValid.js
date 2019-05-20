import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const checkArticleIdValid = async (root, { id, userId },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let article = (await dataSources.database.article.selectArticlesByIds([id]))[0]

    if (article) {
      if (userId && article.user_id !== userId) {
        if (article.user_id !== userId) {
          errors.push({
            path: 'checkArticleIdValid',
            message: 'no permission'
          })
          response = {
            isSuccess: false,
            extension: {
              operator: "check article id if usable",
              errors
            }
          }
        }
      } else {
        response = {
          isSuccess: true,
          extension: {
            operator: "check article id if usable",
            errors
          }
        }
      }
    } else {
      if (!article) {
        errors.push({
          path: 'checkArticleIdValid',
          message: 'article is not exist'
        })
      }
      
      response = {
        isSuccess: false,
        extension: {
          operator: "check article id if usable",
          errors
        }
      }
    }
  } catch (err) {
    errors.push({
      path: 'checkArticleIdValid',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "check article id if usable",
        errors
      }
    }
  }

  return response
}

export default checkArticleIdValid
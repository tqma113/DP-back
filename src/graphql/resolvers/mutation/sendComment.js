import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const sendComment = async (root, { content, articleId },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = currentUser && sessionInfo

    if (isValid) {
      let info = await dataSources.database.comment.createComment(currentUser.id, content)
      await dataSources.database.articleComment.createArticleComments(articleId, [info.insertId])
      
      response = {
        isSuccess: true,
        extension: {
          operator: 'sendComment',
          errors
        }
      }
    } else {
      errors.push({
        path: 'sendComment',
        message: 'auth is invalid'
      })

      response = {
        sessionInfo: {
          username,
          tiken: '',
          isRefresh: false
        },
        isSuccess: false,
        extension: {
          operator: 'sendComment',
          errors
        }
      }
    }
    
    
  } catch (err) {
    errors.push({
      path: 'sendComment',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "send comment",
        errors
      }
    }
  }

  return response
}

export default sendComment
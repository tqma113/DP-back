import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const commentLike = async (root, { commentId, status},  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info ) => {
  let response = {}
  let errors = []

  try {
    let isValid = currentUser && sessionInfo

    if (isValid) {
      if (status) {
        await dataSources.database.commentLike.deleteCommentslike(currentUser.id, commentId)
      } else {
        await dataSources.database.commentLike.createCommentsLike(currentUser.id, commentId)
      }
      
      response = {
        isSuccess: true,
        extension: {
          operator: 'commentLike',
          errors
        }
      }
    } else {
      errors.push({
        path: 'commentLike',
        message: 'auth fail'
      })
      

      response = {
        isSuccess: false,
        extension: {
          operator: 'commentLike',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'commentLike',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "commentLike",
        errors
      }
    }
  }

  return response
}

export default commentLike
import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const categoryStar = async (root, { categoryId, status },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = currentUser && sessionInfo

    if (isValid) {
      if (status) {
        await dataSources.database.userCategory.deleteUserCategorys(currentUser.id, categoryId)
      } else {
        await dataSources.database.userCategory.createUserCategorys(currentUser.id, [categoryId])
      }
      
      response = {
        isSuccess: true,
        extension: {
          operator: 'category star',
          errors
        }
      }
    } else {
      errors.push({
        path: 'categoryStar',
        message: 'auth fail'
      })

      response = {
        isSuccess: false,
        extension: {
          operator: 'categoryStar',
          errors
        }
      }
    }
  } catch (err) {
    errors.push({
      path: 'categoryStar',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "category star",
        errors
      }
    }
  }

  return response
}

export default categoryStar
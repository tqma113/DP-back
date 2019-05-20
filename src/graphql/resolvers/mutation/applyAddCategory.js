import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const applyAddCategory = async (root, { subject, description, image }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = currentUser && sessionInfo && subject && description

    if (isValid) {
      let category = {
        subject,
        description,
        image
      }
      await dataSources.database.applyAddCategory.createAdminAddCategorys(currentUser.id, [category])
      
      response = {
        isSuccess: true,
        extension: {
          operator: 'applyAddCategory',
          errors
        }
      }
    } else {
      if (!currentUser || !sessionInfo) {
        errors.push({
          path: 'applyAddCategory',
          message: 'auth fail'
        })
      } else {
        errors.push({
          path: 'applyAddCategory',
          message: 'category format fail'
        })
      }
      

      response = {
        isSuccess: false,
        extension: {
          operator: 'applyAddCategory',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'applyAddCategory',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "applyAddCategory",
        errors
      }
    }
  }

  return response
}

export default applyAddCategory
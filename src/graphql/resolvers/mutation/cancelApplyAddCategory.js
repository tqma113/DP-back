import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const cancelApplyAddCategory = async (root, { id }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let applyAddCategory
    if (id && typeof id === 'number') {
      applyAddCategory = (await dataSources.database.applyAddCategory.selectApplyAddCategorysById(id))[0]
    }
    let isValid = currentUser && sessionInfo && applyAddCategory && applyAddCategory.status == 1

    if (isValid) {
      await dataSources.database.applyAddCategory.updateApplyAddCategory(id, 'status', -1)

      response = {
        isSuccess: true,
        extension: {
          operator: 'cancelApplyAddCategory',
          errors
        }
      }
    } else {
      if (!currentUser || !sessionInfo) {
        errors.push({
          path: 'cancelApplyAddCategory',
          message: 'auth fail'
        })
      }

      
      if (applyAddCategory.status == 1) {
        errors.push({
          path: 'cancelApplyAddCategory',
          message: 'you have no permission'
        })
      }

      response = {
        isSuccess: false,
        extension: {
          operator: 'cancelApplyAddCategory',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'cancelApplyAddCategory',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "cancelApplyAddCategory",
        errors
      }
    }
  }

  return response
}

export default cancelApplyAddCategory
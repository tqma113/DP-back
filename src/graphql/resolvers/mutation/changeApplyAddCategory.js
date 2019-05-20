import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const changeApplyAddCategory = async (root, { id, subject, description, image }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let applyAddCategory
    if (id && typeof id === 'number') {
      applyAddCategory = (await dataSources.database.applyAddCategory.selectApplyAddCategorysById(id))[0]
    }
    let isValid = currentUser && sessionInfo && applyAddCategory && reason && applyAddCategory.user_id == currentUser.id

    if (isValid) {
      if (subject) await dataSources.database.applyAddCategory.updateApplyAddCategory(id, 'subject', subject)
      if (description) await dataSources.database.applyAddCategory.updateApplyAddCategory(id, 'description', description)
      if (image) await dataSources.database.applyAddCategory.updateApplyAddCategory(id, 'image', image)

      response = {
        isSuccess: true,
        extension: {
          operator: 'changeApplyAddCategory',
          errors
        }
      }
    } else {
      if (!currentUser || !sessionInfo) {
        errors.push({
          path: 'changeApplyAddCategory',
          message: 'auth fail'
        })
      }

      if (!id) {
        errors.push({
          path: 'changeApplyAddCategory',
          message: 'id is null'
        })
      }

      if (!reason) {
        errors.push({
          path: 'changeApplyAddCategory',
          message: 'reason is null'
        })
      }
      
      if (applyAddCategory.user_id != currentUser.id) {
        errors.push({
          path: 'changeApplyAddCategory',
          message: 'you have no permission'
        })
      }

      response = {
        isSuccess: false,
        extension: {
          operator: 'changeApplyAddCategory',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'changeApplyAddCategory',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "changeApplyAddCategory",
        errors
      }
    }
  }

  return response
}

export default changeApplyAddCategory
import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const dealApplyAddCategory = async (root, { id, status }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let applyAddCategory
    if (id && typeof id === 'number') {
      applyAddCategory = (await dataSources.database.applyAddCategory.selectApplyAddCategorysById(id))[0]
    }
    let isValid = currentUser && sessionInfo && applyAddCategory && currentUser.user_type == '1'

    if (isValid) {
      await dataSources.database.applyAddCategory.updateApplyAddCategory(id, 'deal_user_id', currentUser.id)
      await dataSources.database.applyAddCategory.updateApplyAddCategory(id, 'deal_time', new Date())
      await dataSources.database.applyAddCategory.updateApplyAddCategory(id, 'status', status)

      if (status == '1') {
        await dataSources.database.category.createCategorys([applyAddCategory])
      }

      response = {
        isSuccess: true,
        extension: {
          operator: 'dealApplyAddCategory',
          errors
        }
      }
    } else {
      if (!currentUser || !sessionInfo) {
        errors.push({
          path: 'dealApplyAddCategory',
          message: 'auth fail'
        })
      }

      
      if (currentUser.user_type != '1') {
        errors.push({
          path: 'dealApplyAddCategory',
          message: 'you have no permission'
        })
      }

      response = {
        isSuccess: false,
        extension: {
          operator: 'dealApplyAddCategory',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'dealApplyAddCategory',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "dealApplyAddCategory",
        errors
      }
    }
  }

  return response
}

export default dealApplyAddCategory
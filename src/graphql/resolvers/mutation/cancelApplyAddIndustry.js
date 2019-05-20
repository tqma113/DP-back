import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const cancelApplyAddIndustry = async (root, { id, status }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let applyAddIndustry
    if (id && typeof id === 'number') {
      applyAddIndustry = (await dataSources.database.applyAddIndustry.selectApplyAddIndustryById(id))[0]
    }
    let isValid = currentUser && sessionInfo && applyAddIndustry && applyAddIndustry.status == 1

    if (isValid) {
      await dataSources.database.applyAddIndustry.updateApplyAddCategory(id, 'status', -1)

      response = {
        isSuccess: true,
        extension: {
          operator: 'cancelApplyAddIndustry',
          errors
        }
      }
    } else {
      if (!currentUser || !sessionInfo) {
        errors.push({
          path: 'cancelApplyAddIndustry',
          message: 'auth fail'
        })
      }
      
      if (applyAddIndustry.status == 1) {
        errors.push({
          path: 'cancelApplyAddIndustry',
          message: 'you have no permission'
        })
      }
      
      if (applyAddCategory.user_id != currentUser.id) {
        errors.push({
          path: 'cancelApplyAddIndustry',
          message: 'you have no permission'
        })
      }

      response = {
        isSuccess: false,
        extension: {
          operator: 'cancelApplyAddIndustry',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'cancelApplyAddIndustry',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "cancelApplyAddIndustry",
        errors
      }
    }
  }

  return response
}

export default cancelApplyAddIndustry
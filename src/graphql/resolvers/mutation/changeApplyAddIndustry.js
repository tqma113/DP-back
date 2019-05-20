import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const changeApplyAddIndustry = async (root, { id, name, description, image }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let applyAddIndustry
    if (id && typeof id === 'number') {
      applyAddIndustry = (await dataSources.database.applyAddIndustry.selectApplyAddIndustryById(id))[0]
    }
    let isValid = currentUser && sessionInfo && applyAddIndustry && reason && applyAddIndustry.user_id == currentUser.id

    if (isValid) {
      if (name) await dataSources.database.applyAddIndustry.updateApplyAddIndustry(id, 'name', name)
      if (description) await dataSources.database.applyAddIndustry.updateApplyAddIndustry(id, 'description', description)
      if (image) await dataSources.database.applyAddIndustry.updateApplyAddIndustry(id, 'image', image)

      response = {
        isSuccess: true,
        extension: {
          operator: 'changeApplyAddIndustry',
          errors
        }
      }
    } else {
      if (!currentUser || !sessionInfo) {
        errors.push({
          path: 'changeApplyAddIndustry',
          message: 'auth fail'
        })
      }

      if (!id) {
        errors.push({
          path: 'changeApplyAddIndustry',
          message: 'id is null'
        })
      }

      if (!reason) {
        errors.push({
          path: 'changeApplyAddIndustry',
          message: 'reason is null'
        })
      }
      
      if (applyAddIndustry.user_id != currentUser.id) {
        errors.push({
          path: 'changeApplyAddIndustry',
          message: 'you have no permission'
        })
      }

      response = {
        isSuccess: false,
        extension: {
          operator: 'changeApplyAddIndustry',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'changeApplyAddIndustry',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "changeApplyAddIndustry",
        errors
      }
    }
  }

  return response
}

export default changeApplyAddIndustry
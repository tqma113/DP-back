import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const changeApplyAdmin = async (root, { id, reason }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let applyAdmin
    if (id && typeof id === 'number') {
      applyAdmin = (await dataSources.database.applyAdmin.selectApplyAdminsById(id))[0]
    }
    let isValid = currentUser && sessionInfo && applyAdmin && reason && applyAdmin.user_id == currentUser.id

    if (isValid) {
      await dataSources.database.applyAdmin.updateApplyAdmins(id, 'reason',reason)

      response = {
        isSuccess: true,
        extension: {
          operator: 'changeApplyAdmin',
          errors
        }
      }
    } else {
      if (!currentUser || !sessionInfo) {
        errors.push({
          path: 'changeApplyAdmin',
          message: 'auth fail'
        })
      }

      if (!id) {
        errors.push({
          path: 'changeApplyAdmin',
          message: 'id is null'
        })
      }

      if (!reason) {
        errors.push({
          path: 'changeApplyAdmin',
          message: 'reason is null'
        })
      }
      
      if (applyAdmin.user_id != currentUser.id) {
        errors.push({
          path: 'changeApplyAdmin',
          message: 'you have no permission'
        })
      }

      response = {
        isSuccess: false,
        extension: {
          operator: 'changeApplyAdmin',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'changeApplyAdmin',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "changeApplyAdmin",
        errors
      }
    }
  }

  return response
}

export default changeApplyAdmin
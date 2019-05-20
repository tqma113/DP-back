import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const cancelApplyAdmin = async (root, { id, status }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let applyAdmin
    if (id && typeof id === 'number') {
      applyAdmin = (await dataSources.database.applyAdmin.selectApplyAdminsById(id))[0]
    }
    let isValid = currentUser && sessionInfo && applyAdmin && applyAdmin.status == '1'

    if (isValid) {
      if (applyAdmin.status == '1') {
        await dataSources.database.applyAdmin.updateApplyAdmins(id, 'status', -1)
      }

      response = {
        isSuccess: true,
        extension: {
          operator: 'dealApplyAdmin',
          errors
        }
      }
    } else {
      if (!currentUser || !sessionInfo) {
        errors.push({
          path: 'dealApplyAdmin',
          message: 'auth fail'
        })
      }

      if (!status) {
        errors.push({
          path: 'dealApplyAdmin',
          message: 'status is null'
        })
      }
      
      if (applyAdmin.status == '1') {
        errors.push({
          path: 'dealApplyAdmin',
          message: 'you have no permission'
        })
      }

      response = {
        isSuccess: false,
        extension: {
          operator: 'dealApplyAdmin',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'dealApplyAdmin',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "dealApplyAdmin",
        errors
      }
    }
  }

  return response
}

export default cancelApplyAdmin
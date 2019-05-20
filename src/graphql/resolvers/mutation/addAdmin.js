import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const addAdmin = async (root, { id, status }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let user
    if (id && typeof id === 'number') {
      user = (await dataSources.database.user.selectUserById(id))[0]
    }
    let isValid = currentUser && sessionInfo && user && currentUser.user_type == 1

    if (isValid) {
      await dataSources.database.user.updateUserById(id, 'user_type', 1)

      response = {
        isSuccess: true,
        extension: {
          operator: 'addAdmin',
          errors
        }
      }
    } else {
      if (!currentUser || !sessionInfo) {
        errors.push({
          path: 'addAdmin',
          message: 'auth fail'
        })
      }

      if (!status) {
        errors.push({
          path: 'addAdmin',
          message: 'status is null'
        })
      }
      
      if (applyAdmin.user_id != currentUser.id) {
        errors.push({
          path: 'addAdmin',
          message: 'you have no permission'
        })
      }

      response = {
        isSuccess: false,
        extension: {
          operator: 'addAdmin',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'addAdmin',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "addAdmin",
        errors
      }
    }
  }

  return response
}

export default addAdmin
import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const checkUsernameValid = async (root, { username },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let users = await dataSources.database.user.selectUserByUsername(username)
    let isValid = users.length > 0

    if (isValid) {
      response = {
        isSuccess: true,
        extension: {
          operator: "check username if valid",
          errors: []
        }
      }
    } else {
      errors.push({
        path: 'checkUsernameValid',
        message: 'is not exist'
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "check username if valid",
          errors
        }
      }
    }
  } catch (err) {
    errors.push({
      path: 'checkUsernameValid',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "check username if usable",
        errors
      }
    }
  }
 
  return response
}

export default checkUsernameValid
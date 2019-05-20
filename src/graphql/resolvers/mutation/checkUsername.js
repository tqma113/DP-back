import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const checkUsername = async (root, { username },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let users = await dataSources.database.user.selectUserByUsername(username)
    let isValid = users.length === 0 && !(await dataSources.CheckUsernameKey.exists(username))

    if (isValid) {
      let key = await dataSources.CheckUsernameKey.create(username)
      response = {
        key,
        isSuccess: true,
        extension: {
          operator: "check username if usable",
          errors: []
        }
      }
    } else {
      errors.push({
        path: 'checkUsername',
        message: 'has been used'
      })
      response = {
        key: '',
        isSuccess: false,
        extension: {
          operator: "check username if usable",
          errors
        }
      }
    }
  }  catch (err) {
    errors.push({
      path: 'checkUsername',
      message: JSON.stringify(err)
    })
    response = {
      key: '',
      isSuccess: false,
      extension: {
        operator: "check username if usable",
        errors
      }
    }
  }
 
  return response
}

export default checkUsername
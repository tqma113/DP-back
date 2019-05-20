import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const logout = async (root, { },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  let isValid = sessionInfo && currentUser
  console.log(sessionInfo, currentUser)
  if (isValid) {
    dataSources.jwt.stale(currentUser.username)
    currentUser.status = 0
    pubsub.publish(USER_LOGOUT, currentUser)
    response = {
      isSuccess: true,
      extension: {
        operator: 'logout',
        errors
      }
    }
  } else {
    errors.push({
      path: 'logout',
      message: 'auth info fail'
    })
    response = {
      isSuccess: false,
      extension: {
        operator: 'logout',
        errors
      }
    }
  }
  return response
}

export default logout
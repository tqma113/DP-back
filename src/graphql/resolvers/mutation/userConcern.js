import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const userConcern = async (root, {userId, status },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = currentUser && sessionInfo

    if (isValid) {
      if (status) {
        await dataSources.database.userConcerned.deleteUserConcerned(currentUser.id, userId)
      } else {
        await dataSources.database.userConcerned.createUserConcerneds(currentUser.id, [userId])
      }
      
      response = {
        isSuccess: true,
        extension: {
          operator: 'user concern',
          errors
        }
      }
    } else {
      errors.push({
        path: 'userConcern',
        message: 'auth fail'
      })

      response = {
        isSuccess: false,
        extension: {
          operator: 'userConcern',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'userConcern',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "user concern",
        errors
      }
    }
  }

  return response
}

export default userConcern
import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const applyAddIndustry = async (root, { name, description, image }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = currentUser && sessionInfo && name && description

    if (isValid) {
      let category = {
        name,
        description,
        image
      }
      await dataSources.database.applyAddIndustry.createApplyAddIndustry(currentUser.id, category)
      
      response = {
        isSuccess: true,
        extension: {
          operator: 'applyAddIndustry',
          errors
        }
      }
    } else {
      if (!currentUser || !sessionInfo) {
        errors.push({
          path: 'applyAddIndustry',
          message: 'auth fail'
        })
      } else {
        errors.push({
          path: 'applyAddIndustry',
          message: 'category format fail'
        })
      }
      

      response = {
        isSuccess: false,
        extension: {
          operator: 'applyAddIndustry',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'applyAddIndustry',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "applyAddIndustry",
        errors
      }
    }
  }

  return response
}

export default applyAddIndustry
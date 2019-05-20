import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const industryStar = async (root, { industryId, status },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = currentUser && sessionInfo

    if (isValid) {
      if (status) {
        await dataSources.database.userIndustry.deleteUserIndustry(currentUser.id, industryId)
      } else {
        await dataSources.database.userIndustry.createUserIndustrys(currentUser.id, [industryId])
      }
      
      response = {
        isSuccess: true,
        extension: {
          operator: 'industry star',
          errors
        }
      }
    } else {
      errors.push({
        path: 'industryStar',
        message: 'auth fail'
      })
      

      response = {
        isSuccess: false,
        extension: {
          operator: 'industryStar',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'industryStar',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "industry star",
        errors
      }
    }
  }

  return response
}

export default industryStar
import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const addIndustry = async (root, { name, description, image }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let applyAddIndustry
    if (id && typeof id === 'number') {
      applyAddIndustry = (await dataSources.database.applyAddIndustry.selectApplyAddIndustryById(id))[0]
    }
    let isValid = currentUser && sessionInfo && applyAddIndustry && currentUser.user_type == '1'

    if (isValid) {
      let industry = {
        name,
        description,
        image
      }
      await dataSources.database.industry.createIndustrys([industry])

      response = {
        isSuccess: true,
        extension: {
          operator: 'addIndustry',
          errors
        }
      }
    } else {
      if (!currentUser || !sessionInfo) {
        errors.push({
          path: 'addIndustry',
          message: 'auth fail'
        })
      }
      
      if (currentUser.user_type != '1') {
        errors.push({
          path: 'addIndustry',
          message: 'you have no permission'
        })
      }
      
      if (applyAddCategory.user_id != currentUser.id) {
        errors.push({
          path: 'addIndustry',
          message: 'you have no permission'
        })
      }

      response = {
        isSuccess: false,
        extension: {
          operator: 'addIndustry',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'addIndustry',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "addIndustry",
        errors
      }
    }
  }

  return response
}

export default addIndustry
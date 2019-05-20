import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const dealApplyAddIndustry = async (root, { id, status }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let applyAddIndustry
    if (id && typeof id === 'number') {
      applyAddIndustry = (await dataSources.database.applyAddIndustry.selectApplyAddIndustryById(id))[0]
    }
    let isValid = currentUser && sessionInfo && applyAddIndustry && currentUser.user_type == '1'

    if (isValid) {
      await dataSources.database.applyAddIndustry.updateApplyAddIndustry(id, 'deal_user_id', currentUser.id)
      await dataSources.database.applyAddIndustry.updateApplyAddIndustry(id, 'deal_time', new Date())
      await dataSources.database.applyAddIndustry.updateApplyAddIndustry(id, 'status', status)

      if (status == '1') {
        await dataSources.database.industry.createIndustrys([applyAddIndustry])
      }

      response = {
        isSuccess: true,
        extension: {
          operator: 'dealApplyAddIndustry',
          errors
        }
      }
    } else {
      if (!currentUser || !sessionInfo) {
        errors.push({
          path: 'dealApplyAddIndustry',
          message: 'auth fail'
        })
      }
      
      if (currentUser.user_type != '1') {
        errors.push({
          path: 'dealApplyAddIndustry',
          message: 'you have no permission'
        })
      }
      
      if (applyAddCategory.user_id != currentUser.id) {
        errors.push({
          path: 'dealApplyAddIndustry',
          message: 'you have no permission'
        })
      }

      response = {
        isSuccess: false,
        extension: {
          operator: 'dealApplyAddIndustry',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'dealApplyAddIndustry',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "dealApplyAddIndustry",
        errors
      }
    }
  }

  return response
}

export default dealApplyAddIndustry
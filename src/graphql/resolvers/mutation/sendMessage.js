import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const sendMessage = async (root, { userId, message},  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info ) => {
  let response = {}
  let errors = []

  try {
    let acceptUser = (await dataSources.database.user.selectUser({ id: userId }, []))[0]
    let isValid = !!sessionInfo && currentUser && acceptUser

    if (isValid) {
      let info = await dataSources.database.message.createMessage(currentUser.id, userId, message)
      if (info) {
        let messageObj = (await dataSources.database.message.selectMeesageById(info.insertId))[0]
        messageObj.acceptUser = acceptUser
        messageObj.sendUser = currentUser
        pubsub.publish(NEW_MESSAGE, messageObj)

        response = {
          isSuccess: true,
          extension: {
            operator: "send message",
            errors
          }
        }
      } else {
        errors.push({
          path: 'sendMessage',
          message: 'server error'
        })
      }
    } else {
      if (!user || !sessionInfo) {
        errors.push({
          path: 'sendMessage',
          message: 'auth fail'
        })
      }

      if (!acceptUser) {
        errors.push({
          path: 'sendMessage.userId',
          message: 'accept user is not exist'
        })
      }

      response = {
        isSuccess: false,
        extension: {
          operator: 'sendMessage',
          errors
        }
      }
    }

  } catch (err) {
    console.log(err)
    errors.push({
      path: 'sendMessage',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "send message",
        errors
      }
    }
  }

  return response
}

export default sendMessage
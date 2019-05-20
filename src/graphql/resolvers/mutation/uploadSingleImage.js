import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const uploadSingleImage = async (root, { image },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    const { createReadStream, filename, mimetype, encoding } = await image
    const stream = createReadStream()
    const url = await writeWithStream(stream, mimetype)
    
    response = {
      url,
      isSuccess: true,
      extension: {
        operator: "upload file",
        errors
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'ackEmail',
      message: JSON.stringify(err)
    })

    response = {
      url: '',
      isSuccess: false,
      extension: {
        operator: "upload file",
        errors
      }
    }
  }

  return response
}

export default uploadSingleImage
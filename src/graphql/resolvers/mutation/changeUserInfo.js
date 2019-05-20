import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const changeUserInfo = async (root, { email, key, nickname, location, gender, birthday, avatar, statement, eduBG, emRecords, categoryIds, industryIds, secQuestions },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let user = (await dataSources.database.user.selectUser({ email }, ['id']))[0]
    let isValidEKey = await dataSources.Email.AckKey.check(email, key);
    let isValid = currentUser && sessionInfo && user && isValidEKey && user.id == currentUser.id

    if (isValid) {
      if (nickname) {
        await dataSources.database.user.updateUserById(user.id, 'nickname', nickname)
      }
      if (location) {
        await dataSources.database.user.updateUserById(user.id, 'location', location)
      }
      if (birthday) {
        await dataSources.database.user.updateUserById(user.id, 'birthday', birthday)
      }
      if (gender) {
        await dataSources.database.user.updateUserById(user.id, 'gender', gender)
      }
      if (avatar) {
        await dataSources.database.user.updateUserById(user.id, 'avatar', avatar)
      }
      if (statement) {
        await dataSources.database.user.updateUserById(user.id, 'statement', statement)
      }
      if (eduBG && eduBG.length > 0) {
        await dataSources.database.eduBG.deleteEduBGsByUserId(user.id)
        await dataSources.database.eduBG.createEduBGs(user.id, eduBG)
      }
      if (emRecords && emRecords.length > 0) {
        await dataSources.database.emRecord.deleteEmRecordsByUserId(user.id)
        await dataSources.database.emRecord.createEmRecords(user.id, emRecords)
      }
      if (secQuestions && secQuestions.length > 0) {
        await dataSources.database.secQuestion.deleteUserSecQuestionByUserId(user.id)
        await dataSources.database.secQuestion.createSecQuestions(user.id, secQuestions)
      }
      if (categoryIds.length > 0) {
        await dataSources.database.userCategory.deleteUserCategorysByUserId(user.id)
        await dataSources.database.userCategory.createUserCategorys(user.id, categoryIds)
      }
      if (industryIds.length > 0) {
        await dataSources.database.userIndustry.deleteUserIndustrysByUserId(user.id)
        await dataSources.database.userIndustry.createUserIndustrys(user.id, industryIds)
      }

      response = {
        isSuccess: true,
        extension: {
          operator: 'changeUserInfo',
          errors
        }
      }
    } else {
      if (!user || !sessionInfo) {
        errors.push({
          path: 'createArticle',
          message: 'auth fail'
        })
      }
      if (!isValidEKey) {
        errors.push({
          path: 'changeUserInfo',
          message: 'ack key is invalid'
        })
      }
      response = {
        isSuccess: false,
        extension: {
          operator: 'changeUserInfo',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'changeUserInfo',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: "change user info",
        errors
      }
    }
  }

  return response
}

export default changeUserInfo
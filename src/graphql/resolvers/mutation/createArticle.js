import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const createArticle = async (root, { title, abstract, content, categoryIds, industryIds, image }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = !!sessionInfo && currentUser && title && abstract && content && true

    if (isValid) {
      let contentName = await writeJSONSync(content)
      let article = {
        title,
        abstract,
        user_id: currentUser.id,
        content: contentName,
        image
      }

      let newArticle = await dataSources.database.article.createArticle(article)

      if (newArticle) {
        let categorys = await dataSources.database.articleCategory.createArticleCategorys(newArticle.id, categoryIds)
        let industrys = await dataSources.database.articleIndustry.createArticleIndustrys(newArticle.id, industryIds)
        if (industrys.affectedRows=== industryIds.length && categorys.affectedRows=== categoryIds.length) {
          newArticle.industrys = industryIds
          newArticle.categorys = categoryIds
          pubsub.publish(NEW_ARTICLE, newArticle)
          response = {
            article: newArticle,
            isSuccess: true,
            extension: {
              operator: 'createArticle',
              errors
            }
          }
        } else {
          await dataSources.database.articleIndustry.deleteArticleIndustrysByArticleId(newArticle.id)
          await dataSources.database.articleCategory.deleteArticleCategorysByArticleId(newArticle.id)
          await dataSources.database.article.deleteArticleById(newArticle.id)
          errors.push({
            path: 'createArticle',
            message: 'article category setfail'
          })
    
          response = {
            isSuccess: false,
            extension: {
              operator: "create article",
              errors
            }
          }
        }
      } else {
        errors.push({
          path: 'createArticle',
          message: 'createArticle fail'
        })
  
        response = {
          isSuccess: false,
          extension: {
            operator: "create article",
            errors
          }
        }
      }
    } else {
      if (!user || !sessionInfo) {
        errors.push({
          path: 'createArticle',
          message: 'auth fail'
        })
      }

      if (!title) {
        errors.push({
          path: 'createArticle.title',
          message: 'title is invalid'
        })
      }

      if (!abstract) {
        errors.push({
          path: 'createArticle.abstract',
          message: 'abstract is invalid'
        })
      }

      if (!content) {
        errors.push({
          path: 'createArticle.content',
          message: 'content is invalid'
        })
      }

      response = {
        isSuccess: false,
        extension: {
          operator: 'createArticle',
          errors
        }
      }
    }

  } catch (err) {
    console.log(err)
    errors.push({
      path: 'createArticle',
      message: JSON.stringify(err)
    })

    response = {
      isSuccess: false,
      extension: {
        operator: "create article",
        errors
      }
    }
  }

  return response
}

export default createArticle
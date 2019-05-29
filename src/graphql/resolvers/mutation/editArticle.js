import moment from 'moment'
import fs from 'fs'
import path from 'path'

import getPubSub from '../PubSub'
import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from '../events'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from '../config'
import { getRandomFilename, getRandomFilenameWithSuffix, writeWithStream, writeJSONSync, deleteJSON } from '../utils'

const pubsub = getPubSub()

const editArticle = async (root, { id, title, abstract, content, categoryIds, industryIds, image }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let article
    if (id && typeof id === 'number') {
      article = (await dataSources.database.article.selectArticlesByIds([id]))[0]
    }
    let isValid = id && typeof id === 'number' && article && !!sessionInfo && currentUser && title && abstract && content && true
    if (isValid) {
      deleteJSON(article.content)
      writeJSONSync(content, article.content)
      let newArticle = {
        title,
        abstract,
        user_id: currentUser.id,
        image,
        id
      }

      newArticle = await dataSources.database.article.updateArticle(newArticle)
      if (newArticle) {
        let preCategorys = dataSources.database.articleCategory.selectArticleCategorysByArticleId(id)
        let preIndustrys = dataSources.database.articleIndustry.selectArticleIndustrysByArticleId(id)
        await dataSources.database.articleCategory.deleteArticleCategorysByArticleId(id)
        await dataSources.database.articleIndustry.deleteArticleIndustrysByArticleId(id)
        let categorys = await dataSources.database.articleCategory.createArticleCategorys(id, categoryIds)
        let industrys = await dataSources.database.articleIndustry.createArticleIndustrys(id, industryIds)
        if (categorys.affectedRows === categoryIds.length && industrys.affectedRows=== industryIds.length) {
          newArticle.industrys = industryIds
          newArticle.categorys = categoryIds
          response = {
            article: newArticle,
            isSuccess: true,
            extension: {
              operator: 'editArticle',
              errors
            }
          }
        } else {
          await dataSources.database.articleCategory.deleteArticleCategorysByArticleId(id)
          await dataSources.database.articleIndustry.deleteArticleIndustrysByArticleId(id)
          await dataSources.database.articleCategory.createArticleCategorys(id, preCategorys)
          await dataSources.database.articleIndustry.createArticleIndustrys(id, preIndustrys)
          errors.push({
            path: 'editArticle',
            message: 'article category setfail'
          })
    
          response = {
            article: {},
            isSuccess: false,
            extension: {
              operator: "editArticle",
              errors
            }
          }
        }
      } else {
        errors.push({
          path: 'editArticle',
          message: 'editArticle fail'
        })
  
        response = {
          article: {},
          isSuccess: false,
          extension: {
            operator: "editArticle",
            errors
          }
        }
      }
    } else {
      if (!user || !sessionInfo) {
        errors.push({
          path: 'editArticle',
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

      if (!id || !article) {
        errors.push({
          path: 'createArticle.content',
          message: 'article is not exist'
        })
      }

      response = {
        article: {},
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

export default editArticle
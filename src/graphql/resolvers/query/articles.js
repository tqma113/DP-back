import { readJSONAsync } from '../utils'

const articles = async (root, { idList, categoryIds }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  const getComComments = (id) => new Promise((resolve, reject) => {
    try {
      dataSources.database.comComment.selectComCommentByCommentedId(id).then(comComents => {
        if (comComents.length > 0) {
          let idArr = comComents.map(i => i.comment_id)
          dataSources.database.comment.selectCommentsById(idArr).then(comments => {
            comments.map(async item => {
              item.comments = getComComments(item.id)
              item.user = (await dataSources.database.user.selectUserById(item.user_id))[0]
            })
            resolve(comments)
          })
        } else {
          resolve([])
        }
      })
      
    } catch (err) {
      reject(err)
    }
  })

  try {
    let partArticles = []
    if (idList && idList.length && idList.length > 0) {
      partArticles = await dataSources.database.article.selectArticlesByIds(idList)
    } else {
      partArticles = await dataSources.database.article.selectArticle()
    }
    if (categoryIds && categoryIds.length && categoryIds.length > 0) {
      let articleCategorys = await dataSources.database.articleCategory.selectArticleCategorysByCategoryIds(categoryIds)
      partArticles.filter(item => articleCategorys.some(i => i.article_id == item.id))
    }
    let articles = partArticles.map(async item => {
      item.content = JSON.parse(await readJSONAsync(item.content))
      item.user = (await dataSources.database.user.selectUserById(item.user_id))[0]
      item.categorys = (await dataSources.database.articleCategory.selectArticleCategorysByArticleId(item.id)).map(item => item.category_id)
      item.collections = (await dataSources.database.articleCollection.selectArticleCollectionsByArticleId(item.id)).map(async item => {
        item.user = (await dataSources.database.user.selectUserById(item.user_id))[0]
        return item
      })
      let commentIds = (await dataSources.database.articleComment.selectArticleCommentsByArticleId(item.id)).map(item => item.comment_id)
      if (commentIds.length > 0) {
        item.comments = (await dataSources.database.comment.selectCommentsById(commentIds)).map(async item => {
          item.user = (await dataSources.database.user.selectUserById(item.user_id))[0]
          item.likes = (await dataSources.database.commentLike.selectCommentLikeByCommentId(item.id))
          item.comments = await getComComments(item.id)
          return item
        })
      } else {
        item.comments = []
      }
      item.likes = (await dataSources.database.articleLike.selectArticleLikesByArticleId(item.id)).map(async item => {
        item.user = (await dataSources.database.user.selectUserById(item.user_id))[0]
        return item
      })
      item.project_link = (await dataSources.database.projectLink.selectProjectLinkByArticleId(item.id)).map(item => item.link)
      return item
    })
    response = {
      isSuccess: true,
      articles,
      extension: {
        operator: "articles query",
        errors
      }
    }
  } catch (err) {
    conosle.log(err)
    errors.push({
      path: 'users',
      message: JSON.stringify(err)
    })

    response = {
      isSuccess: false,
      articles: [],
      extension: {
        operator: "articles query",
        errors
      }
    }
  }

  return response
}

export default articles
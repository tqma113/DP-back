
import fs from 'fs'
import path from 'path'

const JSON_LOAD_PATH = __dirname + '/../../public/JSON'

const readJSONAsync = (filename) => new Promise((resolve, reject) => {
  fs.readFile(path.resolve(JSON_LOAD_PATH, filename),'utf-8',function(err,data){
    if(err){
        reject(err);
    }else{
        resolve(data);
    }
});
})

export default {
  init: async (root, { }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []
    const queryAsync = async (i) => {
      i.industrys =  (await dataSources.database.userIndustry.selectUserIndustrysByUserId(i.id)).map(item => item.industry_id)
      i.eduBG = await dataSources.database.eduBG.selectEduBGsByUserId(i.id)
      i.emRecords = await dataSources.database.emRecord.selectEmRecordsByUserId(i.id)
      i.articles = await dataSources.database.article.selectArticlesByUserIds([i.id])
      i.categorys = (await dataSources.database.userCategory.selectUserCategorysByUserId(i.id)).map(item => item.category_id)
      i.concerned = await dataSources.database.userConcerned.selectUserConcernedsByUserId(i.id)
      i.concern = await dataSources.database.userConcerned.selectUserConcernedsByConcernedUserId(i.id)
      i.likes = await dataSources.database.articleLike.selectArticleLikesByUserId(i.id)
      i.collections = await dataSources.database.articleCollection.selectArticleCollectionsByUserId(i.id)
      i.dynamics = []
      return i
    }
    try {
      let isValid = !!sessionInfo && currentUser

      if (isValid) {
        let user = currentUser
        user = await queryAsync(user)

        response = {
          user,
          isSuccess: true,
          extension: {
            operator: 'checkLoginState',
            errors
          }
        }
      } else {
        errors.push({
          path: 'sendMessage',
          message: 'auth fail'
        })

        response = {
          isSuccess: false,
          extension: {
            operator: 'checkLoginState',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'checkLoginState',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: 'checkLoginState',
          errors
        }
      }
    }
    
    return response
  },
  users: async (root, { idList, usernames, categoryIds, industryIds }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []
    
    const queryAsync = async (i) => {
      i.industrys =  (await dataSources.database.userIndustry.selectUserIndustrysByUserId(i.id)).map(item => item.industry_id)
      i.eduBG = await dataSources.database.eduBG.selectEduBGsByUserId(i.id)
      i.emRecords = await dataSources.database.emRecord.selectEmRecordsByUserId(i.id)
      i.articles = await dataSources.database.article.selectArticlesByUserIds([i.id])
      i.categorys = (await dataSources.database.userCategory.selectUserCategorysByUserId(i.id)).map(item => item.category_id)
      i.concerned = await dataSources.database.userConcerned.selectUserConcernedsByUserId(i.id)
      i.concern = await dataSources.database.userConcerned.selectUserConcernedsByConcernedUserId(i.id)
      i.likes = await dataSources.database.articleLike.selectArticleLikesByUserId(i.id)
      i.collections = await dataSources.database.articleCollection.selectArticleCollectionsByUserId(i.id)
      i.dynamics = []
      return i
    }
    try {
      let users = []
      if (idList && idList.length && idList.length > 0) {
        users = await dataSources.database.user.selectUsersByIds(idList)
      } else if (usernames && usernames.length && usernames.length > 0) {
        users = await dataSources.database.user.selectUsersByUsernames(usernames)
      } else if (categoryIds && categoryIds.length && categoryIds.length > 0) {
        let userIds = (await dataSources.database.userCategory.selectUserCategorysByCategoryIds(categoryIds)).map(item => item.user_id)
        users = await dataSources.database.user.selectUsersByIds(userIds)
      } else if (industryIds && industryIds.length && industryIds.length > 0) {
        let userIds = (await dataSources.database.userIndustry.selectUserIndustrysByIndustryIds(industryIds)).map(item => item.user_id)
        users = await dataSources.database.user.selectUsersByIds(userIds)
      } else {
        users = await dataSources.database.user.selectUsers()
      }

      users = users.map(async i => queryAsync(i))
      
      response = {
        users,
        isSuccess: true,
        extension: {
          operator: 'users query',
          errors
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'users',
        message: JSON.stringify(err)
      })

      response = {
        isSuccess: false,
        users: [],
        extension: {
          operator: "users query",
          errors
        }
      }
    }

    // console.log(response)
    return response
  },
  categorys: async (root, { }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []
    try {
      let categorys = await dataSources.database.category.selectCategory()
      categorys = categorys.map(async item => {
        item.users = await dataSources.database.userCategory.selectUserCategorysByCategoryId(item.id)
        return item
      })
      response = {
        categorys,
        isSuccess: true,
        extension: {
          operator: 'categorys query',
          errors
        }
      }
    } catch (err) {
      errors.push({
        path: 'categorys',
        message: JSON.stringify(err)
      })

      response = {
        isSuccess: false,
        categorys: [],
        extension: {
          operator: "categorys query",
          errors
        }
      }
    }
    return response
  },
  industrys: async (root, { }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []
    try {
      let industrys = await dataSources.database.industry.selectIndustry()
      industrys = industrys.map(async item => {
        item.users = await dataSources.database.userIndustry.selectUserIndustrysByIndustryId(item.id)
        return item
      })
      response = {
        industrys,
        isSuccess: true,
        extension: {
          operator: 'industrys query',
          errors
        }
      }
    } catch (err) {
      errors.push({
        path: 'industrys',
        message: JSON.stringify(err)
      })

      response = {
        isSuccess: false,
        industrys: [],
        extension: {
          operator: "industrys query",
          errors
        }
      }
    }
    return response
  },
  articles: async (root, { idList, categoryIds }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
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
  },
  messages: async (root, { userId }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let acceptUser = (await dataSources.database.user.selectUserById(userId))[0]
      let isValid = !!sessionInfo && currentUser && acceptUser && acceptUser.id

      if (isValid) {
        let messages = await dataSources.database.message.selectMessageByASUserId(userId, currentUser.id)
        messages.map(item => {
          if (item.a_user_id == acceptUser.id) {
            item.acceptUser = acceptUser
            item.sendUser = currentUser
          } else {
            item.acceptUser = currentUser
            item.sendUser = acceptUser
          }
          return item
        })
        response = {
          messages,
          isSuccess: true,
          extension: {
            operator: 'checkLoginState',
            errors
          }
        }
      } else {
        if (!sessionInfo || !currentUser) {
          errors.push({
            path: 'sendMessage',
            message: 'auth fail'
          })
        }

        if (!acceptUser || !acceptUser.id) {
          errors.push({
            path: 'sendMessage',
            message: 'accept user is not exist'
          })
        }

        response = {
          isSuccess: false,
          extension: {
            operator: 'checkLoginState',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'checkLoginState',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: 'checkLoginState',
          errors
        }
      }
    }

    return response
  },
}
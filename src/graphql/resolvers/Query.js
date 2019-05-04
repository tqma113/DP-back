
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
  checkLoginState: async (root, { username, token }, { dataSources }, info) => {
    let response = {}
    let errors = []
    const queryAsync = async (i) => {
      i.industrys =  (await dataSources.database.userIndustry.selectUserIndustrysByUserId(i.id)).map(item => item.industry_id)
      i.eduBG = await dataSources.database.eduBG.selectEduBGsByUserId(i.id)
      i.emRecords = await dataSources.database.emRecord.selectEmRecordsByUserId(i.id)
      i.articles = (await dataSources.database.article.selectArticlesByUserIds([i.id])).map(async item => {
        item.likes = await dataSources.database.articleLike.selectArticleLikesByArticleId(item.id)
        item.collections = await dataSources.database.articleCollection.selectArticleCollectionsByArticleId(item.id)
        item.categorys = (await dataSources.database.articleCategory.selectArticleCategorysByArticleId(item.id)).map(item => item.category_id)
        item.collections = (await dataSources.database.articleCollection.selectArticleCollectionsByArticleId(item.id)).map(async item => {
          item.user = (await dataSources.database.user.selectUserById(item.user_id))[0]
          return item
        })
        let articleCommentIds = (await dataSources.database.articleComment.selectArticleCommentsByArticleId(item.id)).map(i => i.comment_id)
        if (articleCommentIds.length > 0) {
          item.comments = await dataSources.database.comment.selectCommentsById(articleCommentIds)
        } else {
          item.comments = []
        }
        item.project_link = (await dataSources.database.projectLink.selectProjectLinkByArticleId(item.id)).map(item => item.link)
        return item
      })
      i.categorys = (await dataSources.database.userCategory.selectUserCategorysByUserId(i.id)).map(item => item.category_id)
      i.concerned = (await dataSources.database.userConcerned.selectUserConcernedsByUserId(i.id)).map(async item => {
        item.user = (await dataSources.database.user.selectUserById(item.concerned_user_id))[0]
        item.user.categorys = (await dataSources.database.userCategory.selectUserCategorysByUserId(item.concerned_user_id)).map(item => item.category_id)
        item.user.industrys = (await dataSources.database.userIndustry.selectUserIndustrysByUserId(item.concerned_user_id)).map(item => item.industry_id)
        return item
      })
      i.likes = (await dataSources.database.articleLike.selectArticleLikesByUserId(i.id)).map(async item => {
        item.article = (await dataSources.database.article.selectArticlesByIds([item.article_id]))[0]
        return item
      })
      i.collections = (await dataSources.database.articleCollection.selectArticleCollectionsByUserId(i.id)).map(async item => {
        item.article = (await dataSources.database.article.selectArticlesByIds([item.article_id]))[0]
        return item
      })
      i.dynamics = []
      return i
    }
    try {
      let user = {}

      if (username.indexOf('@') !== -1) {
        user = (await dataSources.database.user.selectUser({ email: username }, ['password']))[0]
      } else {
        user = (await dataSources.database.user.selectUser({ username }, ['password']))[0]
      }
  
      let sessionInfo = await dataSources.jwt.verify(username, token)
      let isValid = !!sessionInfo && user

      if (isValid) {
        user = (await dataSources.database.user.selectUser({ username }, []))[0]        
        user = await queryAsync(user)

        response = {
          sessionInfo: {
            username,
            token,
            isRefresh: false
          },
          user,
          isSuccess: true,
          extension: {
            operator: 'checkLoginState',
            errors
          }
        }
      } else {
        if (!user) {
          errors.push({
            path: 'checkLoginState.username',
            message: 'username is not exist'
          })
        }
        
        if (!sessionInfo) {
          errors.push({
            path: 'checkLoginState.token',
            message: 'token is invalid'
          })
        }

        response = {
          sessionInfo: {
            username,
            tiken: '',
            isRefresh: false
          },
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
        sessionInfo: {
          username,
          tiken: '',
          isRefresh: false
        },
        isSuccess: false,
        extension: {
          operator: 'checkLoginState',
          errors
        }
      }
    }
    
    return response
  },
  users: async (root, { usernames }, { dataSources }, info) => {
    let response = {}
    let errors = []
    
    const queryAsync = async (i) => {
      i.industrys =  (await dataSources.database.userIndustry.selectUserIndustrysByUserId(i.id)).map(item => item.industry_id)
      i.eduBG = await dataSources.database.eduBG.selectEduBGsByUserId(i.id)
      i.emRecords = await dataSources.database.emRecord.selectEmRecordsByUserId(i.id)
      i.articles = (await dataSources.database.article.selectArticlesByUserIds([i.id])).map(async item => {
        item.likes = await dataSources.database.articleLike.selectArticleLikesByArticleId(item.id)
        item.collections = await dataSources.database.articleCollection.selectArticleCollectionsByArticleId(item.id)
        item.categorys = (await dataSources.database.articleCategory.selectArticleCategorysByArticleId(item.id)).map(item => item.category_id)
        item.collections = (await dataSources.database.articleCollection.selectArticleCollectionsByArticleId(item.id)).map(async item => {
          item.user = (await dataSources.database.user.selectUserById(item.user_id))[0]
          return item
        })
        let articleCommentIds = (await dataSources.database.articleComment.selectArticleCommentsByArticleId(item.id)).map(i => i.comment_id)
        if (articleCommentIds.length > 0) {
          item.comments = await dataSources.database.comment.selectCommentsById(articleCommentIds)
        } else {
          item.comments = []
        }
        item.project_link = (await dataSources.database.projectLink.selectProjectLinkByArticleId(item.id)).map(item => item.link)
        return item
      })
      i.categorys = (await dataSources.database.userCategory.selectUserCategorysByUserId(i.id)).map(item => item.category_id)
      i.concerned = (await dataSources.database.userConcerned.selectUserConcernedsByUserId(i.id)).map(async item => {
        item.user = (await dataSources.database.user.selectUserById(item.concerned_user_id))[0]
        item.user.categorys = (await dataSources.database.userCategory.selectUserCategorysByUserId(item.concerned_user_id)).map(item => item.category_id)
        item.user.industrys = (await dataSources.database.userIndustry.selectUserIndustrysByUserId(item.concerned_user_id)).map(item => item.industry_id)
        return item
      })
      i.likes = (await dataSources.database.articleLike.selectArticleLikesByUserId(i.id)).map(async item => {
        item.article = (await dataSources.database.article.selectArticlesByIds([item.article_id]))[0]
        return item
      })
      i.collections = (await dataSources.database.articleCollection.selectArticleCollectionsByUserId(i.id)).map(async item => {
        item.article = (await dataSources.database.article.selectArticlesByIds([item.article_id]))[0]
        return item
      })
      i.dynamics = []
      return i
    }
    try {
      let promises = usernames.map(username => dataSources.database.user.selectUser({ username }))
      let users = await Promise.all((await Promise.all(promises)).map(i => queryAsync(i[0])))
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
  categorys: async (root, { }, { dataSources }, info) => {
    let response = {}
    let errors = []
    try {
      let categorys = await dataSources.database.category.selectCategory()
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
  industrys: async (root, { }, { dataSources }, info) => {
    let response = {}
    let errors = []
    try {
      let industrys = await dataSources.database.industry.selectIndustry()
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
  articles: async (root, { idList }, { dataSources }, info) => {
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
      let partArticles = await dataSources.database.article.selectArticlesByIds(idList)
      let articles = partArticles.map(async item => {
        item.content = JSON.parse(await readJSONAsync(item.content))
        item.user = (await dataSources.database.user.selectUserById(item.user_id))[0]
        item.categorys = (await dataSources.database.articleCategory.selectArticleCategorysByArticleId(item.id)).map(item => item.category_id)
        item.collections = (await dataSources.database.articleCollection.selectArticleCollectionsByArticleId(item.id)).map(async item => {
          item.user = (await dataSources.database.user.selectUserById(item.user_id))[0]
          return item
        })
        item.comments = (await dataSources.database.comment.selectCommentsById((await dataSources.database.articleComment.selectArticleCommentsByArticleId(item.id)).map(item => item.comment_id))).map(async item => {
          item.user = (await dataSources.database.user.selectUserById(item.user_id))[0]
          item.likes = (await dataSources.database.commentLike.selectCommentLikeByCommentId(item.id))
          item.comments = await getComComments(item.id)
          return item
        })
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
}
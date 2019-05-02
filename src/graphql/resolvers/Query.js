
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
        user.industry = []
        user.eduBG = []
        user.emRecords = []
        user.articles = await dataSources.database.article.selectArticlesByUserIds([user.id])
        user.categorys = []
        user.concerned_categorys = []
        user.concerned = []
        user.likes = []
        user.collections = []
        user.dynamics = []
  
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
      errors.push({
        path: 'register',
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
      i.industry = []
      i.eduBG = []
      i.emRecords = []
      i.articles = await dataSources.database.article.selectArticlesByUserIds([i.id])
      i.categorys = []
      i.concerned_categorys = []
      i.concerned = []
      i.likes = []
      i.collections = []
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

    try {
      let partArticles = await dataSources.database.article.selectArticlesByIds(idList)
      let articles = partArticles.map(async item => {
        let content = await readJSONAsync(item.content)
        item.content = content
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
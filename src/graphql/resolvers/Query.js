export default {
  checkLoginState: async (root, { username, token }, { dataSources }, info) => {
    let response = {}
    let errors = []
    try {
      let user = {}

      if (username.indexOf('@') !== -1) {
        user = (await dataSources.user.selectUser({ email: username }, ['password']))[0]
      } else {
        user = (await dataSources.user.selectUser({ username }, ['password']))[0]
      }
  
      let sessionInfo = await dataSources.jwt.verify(username, token)
      let isValid = !!sessionInfo && user

      if (isValid) {
        user = (await dataSources.user.selectUser({ username }, []))[0]
        user.industry = []
        user.eduBC = []
        user.articles = []
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
    try {
      let promises = usernames.map(username => dataSources.user.selectUser({ username }))
      let users = (await Promise.all(promises)).map(i => {
        i[0].industry = []
        i[0].eduBC = []
        i[0].articles = []
        i[0].categorys = []
        i[0].concerned_categorys = []
        i[0].concerned = []
        i[0].likes = []
        i[0].collections = []
        i[0].dynamics = []
        return i[0]
      })
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
      let categorys = await dataSources.category.selectCategory()
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
        path: 'users',
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
  }
}
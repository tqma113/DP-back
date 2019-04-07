export default {
  login: async (root, { username, password }, { dataSources }, info) => {
    let response = {}
    let errors = []

    let user = (await dataSources.user.selectUser({ username }, ['password']))[0]

    let isValid = user && user.password && user.password === password
    if (!isValid) {
      if (!user) {
        errors.push({
          path: 'login. username',
          message: 'username is not exist'
        })
      }
      
      if (user && user.password && user.password !== password) {
        errors.push({
          path: 'login. password',
          message: 'password is not right'
        })
      }
    }

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

      let token = dataSources.jwt.sign({ username })

      response = {
        sessionInfo: {
          username,
          token,
          isRefresh: false
        },
        user,
        success: true,
        extension: {
          operator: 'login',
          errors
        }
      }
    } else {
      response = {
        sessionInfo: {
          username,
          tiken: '',
          isRefresh: false
        },
        user: {},
        success: false,
        extension: {
          operator: 'login',
          errors
        }
      }
    }

    return response
  },
  checkLoginState: async (root, { username, token }, { dataSources }, info) => {
    
    return {
      
    }
  }
}
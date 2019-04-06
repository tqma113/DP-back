const { PubSub, withFilter } = require('apollo-server');
import CheckUsernameKey from '../../key/check_username';
import CheckEmailKey from '../../key/check_email'

import Email from '../../email/index'

const USER_ADDED = 'USER_ADDED';
const USER_UPDATED = 'USER_UPDATED';
const USER_DELETED = 'USER_DELETED';

const pubsub = new PubSub();

export default {
  register: async (root, { username, nickname, head_portrait, gender, location, birthday, email, statement, u_key, e_key}, { dataSources }, info) => {
    let newUser = {
      username,
      nickname,
      head_portrait,
      gender,
      location,
      birthday,
      email,
      statement
    }

    let errors = []
    let response = {}

    let isValidUKey = CheckUsernameKey.check(username, u_key);
    let isValidEKey = Email.AckKey.check(email, e_key);

    if (!isValidUKey) {
      errors.push({
        path: 'register. username ack',
        message: 'username has not been ack'
      })
    }

    if (!isValidEKey) {
      errors.push({
        path: 'register. email ack',
        message: 'email has not been ack'
      })
    }

    if (isValidEKey && isValidUKey) {
      CheckUsernameKey.delete(username)
      Email.AckKey.delete(email)

      response = await dataSources.user.createUser(newUser)
      .then((user) => {
        user.industry = []
        user.eduBC = []
        user.articles = []
        user.categorys = []
        user.concerned_categorys = []
        user.concerned = []
        user.likes = []
        user.collections = []
        user.dynamics = []
  
        return {
          sessionInfo: {
            username,
            tiken: 'adfadf.adfdfsadsf',
            isRefresh: false
          },
          user,
          success: true,
          extension: {
            operator: 'craete user',
            errors: []
          }
        }
      })
      .catch((err) => {
        return {
          sessionInfo: {
            username,
            tiken: '',
            isRefresh: false
          },
          user: newUser,
          success: false,
          extension: {
            operator: 'craete user',
            errors: [err]
          }
        }
      })
    } else {
      response = {
        sessionInfo: {
          username,
          tiken: '',
          isRefresh: false
        },
        user: newUser,
        success: false,
        extension: {
          operator: 'craete user',
          errors
        }
      }
    }

    return response
  },
  setPassword: async (root, { username, password, code }, { dataSources }, info) => {
    return {

    }
  },
  checkUsername: async (root, { username }, { dataSources }, info) => {
    let response = dataSources.user.selectUserByUsername(username)
      .then((users) => {
        if (users.length > 0 && !CheckUsernameKey.exists(username)) {
          return {
            key: '',
            success: false,
            extension: {
              operator: "check username if usable",
              errors: [{
                path: 'resolver',
                message: 'has been used'
              }]
            }
          }
        } else {
          let key = CheckUsernameKey.create(username)

          return {
            key,
            success: true,
            extension: {
              operator: "check username if usable",
              errors: []
            }
          }
        }
      })
      .catch((err) => ({
        key: '',
        success: false,
        extension: {
          operator: "check username if usable",
          errors: [err]
        }
      }))

    return response
  },
  sendEmailCode: async (root, { email }, { dataSources }, info) => {
    let response = dataSources.user.selectUserByEmail(email)
      .then((users) => {
        if (users.length > 0 && !CheckEmailKey.exists(email)) {
          return {
            key: '',
            success: false,
            extension: {
              operator: "check email if usable&&send email code",
              errors: [{
                path: 'resolver check',
                message: 'has been used'
              }]
            }
          }
        } else {
          let key = CheckEmailKey.create(email)
          let info = Email.sendCode(email)

          return {
            key,
            success: true,
            extension: {
              operator: "check email if usable&&send email code",
              errors: []
            }
          }
        }
      })
      .catch((err) => ({
        key: '',
        success: false,
        extension: {
          operator: "check email if usable&&send email code",
          errors: [err]
        }
      }))

    return response
  },
  ackEemail: async (root, { email, code }, { dataSources }, info) => {
    let isValid = Email.checkCode(email, code)

    if (isValid) {
      Email.deleteCode(email)
      let key = Email.AckKey.create(email)
      return {
        key: key,
        success: true,
        extension: {
          operator: "ack email code",
          errors: []
        }
      }
    } else {
      return {
        key: '',
        success: false,
        extension: {
          operator: "ack email code",
          errors: [{
            path: 'Email code',
            message: 'not valid'
          }]
        }
      }
    }
  },
  // uploadSingleFile: async (root, { file }, { dataSources }, info) => {
  //   file.then((file) => {

  //   })
  // },
}
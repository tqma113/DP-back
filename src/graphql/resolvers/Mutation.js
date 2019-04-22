import { PubSub, withFilter } from 'apollo-server';
import moment from 'moment'
import fs from 'fs'
import path from 'path'

const USER_ADDED = 'USER_ADDED';
const USER_UPDATED = 'USER_UPDATED';
const USER_DELETED = 'USER_DELETED';

const IMAGE_LOAD_PATH = __dirname + '/../../public/image'

const pubsub = new PubSub();

const getRandomFilename = (mimetype) => {
  const all = 'qwertyuiopasdfghjklzxcvbnm-1234567890'
  let filename = ''
  let suffix = '.' + mimetype.split('/')[1]

  for(let i = 0;i < 36;i++) {
    filename += all[parseInt(Math.random() * (all.length - 1))]
  }

  return filename + suffix
}

const writeWithStream = (stream, mimetype) => new Promise((resolve, reject) => {
  let filename = getRandomFilename(mimetype)
  let out = fs.createWriteStream(path.resolve(IMAGE_LOAD_PATH, filename))

  stream.on('data', data => out.write(data))
  stream.on('end', () => resolve('image/' + filename))
  stream.on('error', reject)
})

export default {
  login: async (root, { username, password }, { dataSources, res }, info) => {
    let response = {}
    let errors = []
    let user = {}

    try {
      if (username.indexOf('@') !== -1) {
        user = (await dataSources.user.selectUser({ email: username }, ['password']))[0]
      } else {
        user = (await dataSources.user.selectUser({ username }, ['password']))[0]
      }
  
      let isValid = user && user.password && user.password === password
  
      if (isValid) {
        let token = await dataSources.jwt.sign(username)
  
        response = {
          token,
          username,
          isSuccess: true,
          extension: {
            operator: 'login',
            errors
          }
        }
        let cookie = `customer=${username};username=${username};path=/;Expires=${moment().add(7, 'd').format('ddd, D MMM YYYY HH:mm:SS')} GMT;Secure;HttpOnly`
        res.setHeader('Set-Cookie', cookie)
      } else {
        if (!user) {
          errors.push({
            path: 'login.username',
            message: 'username is not exist'
          })
        }
        
        if (user && user.password && user.password !== password) {
          errors.push({
            path: 'login.password',
            message: 'password is not right'
          })
        }

        response = {
          isSuccess: false,
          extension: {
            operator: 'login',
            errors
          }
        }
      }
    } catch (err) {
      errors.push({
        path: 'login',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: 'login',
          errors
        }
      }
    }
    
    return response
  },
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

    try {
      let isValidUKey = await dataSources.CheckUsernameKey.check(username, u_key);
      let isValidEKey = await dataSources.Email.AckKey.check(email, e_key);
      let isValid = isValidEKey && isValidUKey
  
      if (isValid) {
        await dataSources.CheckUsernameKey.delete(username)
        await dataSources.Email.AckKey.delete(email)
  
        let user = await dataSources.user.createUser(newUser)
        let token = await dataSources.jwt.sign(username)
        
        response = {
          token,
          username: user.username,
          isSuccess: true,
          extension: {
            operator: 'register',
            errors
          }
        }
      } else {
        if (!isValidUKey) {
          errors.push({
            path: 'register.username_ack',
            message: 'username has not been ack'
          })
        }
    
        if (!isValidEKey) {
          errors.push({
            path: 'register.email_ack',
            message: 'email has not been ack'
          })
        }
        response = {
          isSuccess: false,
          extension: {
            operator: 'register',
            errors
          }
        }
      }
    }  catch (err) {
      errors.push({
        path: 'register',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: 'register',
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
    let response = {}
    let errors = []

    try {
      let users = await dataSources.user.selectUserByUsername(username)
      let isValid = users.length === 0 && !(await dataSources.CheckUsernameKey.exists(username))

      if (isValid) {
        let key = await dataSources.CheckUsernameKey.create(username)
        response = {
          key,
          isSuccess: true,
          extension: {
            operator: "check username if usable",
            errors: []
          }
        }
      } else {
        errors.push({
          path: 'checkUsername',
          message: 'has been used'
        })
        response = {
          key: '',
          isSuccess: false,
          extension: {
            operator: "check username if usable",
            errors
          }
        }
      }
    }  catch (err) {
      errors.push({
        path: 'checkUsername',
        message: JSON.stringify(err)
      })
      response = {
        key: '',
        isSuccess: false,
        extension: {
          operator: "check username if usable",
          errors
        }
      }
    }
   
    return response
  },
  sendEmailCode: async (root, { email }, { dataSources }, info) => {
    let response = {}
    let errors = []
    try {
      let users = await dataSources.user.selectUserByEmail(email)
      let isValid = users.length === 0 && !(await dataSources.CheckEmailKey.exists(email))

      if (isValid) {
        let key = await dataSources.CheckEmailKey.create(email)
        let info = await dataSources.Email.sendCode(email)

        response = {
          key,
          isSuccess: true,
          extension: {
            operator: "check email if usable&&send email code",
            errors
          }
        }
      } else {
        errors.push({
          path: 'sendEmailCode.check',
          message: 'has been used'
        })
        response = {
          key: '',
          isSuccess: false,
          extension: {
            operator: "check email if usable&&send email code",
            errors
          }
        }
      }
    } catch(err) {
      errors.push({
        path: 'checkUsername',
        message: JSON.stringify(err)
      })
      response = {
        key: '',
        isSuccess: false,
        extension: {
          operator: "check email if usable&&send email code",
          errors
        }
      }
    }

    return response
  },
  ackEmail: async (root, { email, code, key }, { dataSources }, info) => {
    let response = {}
    let errors = []
    try {
      let isValidCode = await dataSources.Email.checkCode(email, code)
      let isValidKey = await dataSources.CheckEmailKey.check(email, key)
      let isValid = isValidCode && isValidKey

      if (isValid) {
        await dataSources.Email.deleteCode(email)
        let key = await dataSources.Email.AckKey.create(email)
        response = {
          key: key,
          isSuccess: true,
          extension: {
            operator: "ack email code",
            errors
          }
        }
      } else {
        if (!isValidCode) {
          errors.push({
            path: 'ackEemail',
            message: 'code not valid'
          })
        }

        if (!isValidKey) {
          errors.push({
            path: 'ackEemail',
            message: 'key not valid'
          })
        }
        
        response = {
          key: '',
          isSuccess: false,
          extension: {
            operator: "ack email code",
            errors
          }
        }
      }
    } catch(err) {
      errors.push({
        path: 'ackEmail',
        message: JSON.stringify(err)
      })
      response = {
        key: '',
        isSuccess: false,
        extension: {
          operator: "check email if usable&&send email code",
          errors
        }
      }
    }

    return response
  },
  logout: async (root, { username, token }, { dataSources }, info) => {
    
    return {
      
    }
  },
  uploadSingleImage: async (root, { image }, { dataSources }, info) => {
    let response = {}
    let errors = []

    try {
      const { createReadStream, filename, mimetype, encoding } = await image
      const stream = createReadStream()
      const url = await writeWithStream(stream, mimetype)
      
      response = {
        url,
        isSuccess: true,
        extension: {
          operator: "upload file",
          errors
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'ackEmail',
        message: JSON.stringify(err)
      })

      response = {
        url: '',
        isSuccess: false,
        extension: {
          operator: "upload file",
          errors
        }
      }
    }

    return response
  },
}
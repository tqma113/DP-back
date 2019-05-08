import moment from 'moment'
import fs from 'fs'
import path from 'path'
import getPubSub from './PubSub'

import database from '../../database/index'

import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from './events'

const IMAGE_LOAD_PATH = __dirname + '/../../public/image'
const JSON_LOAD_PATH = __dirname + '/../../public/JSON'

const getRandomFilename = (mimetype) => {
  const all = 'qwertyuiopasdfghjklzxcvbnm-1234567890'
  let filename = ''
  let suffix = '.' + mimetype.split('/')[1]

  for(let i = 0;i < 36;i++) {
    filename += all[parseInt(Math.random() * (all.length - 1))]
  }

  return filename + suffix
}

const pubsub = getPubSub()

const getRandomFilenameWithSuffix = (suffix) => {
  const all = 'qwertyuiopasdfghjklzxcvbnm-1234567890'
  let filename = ''

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

const writeJSONSync = (buffer) => new Promise((resolve, reject) => {
  let filename = getRandomFilenameWithSuffix('.json')

  fs.writeFile(path.resolve(JSON_LOAD_PATH, filename), buffer, { flag: "a" }, function (err) {
    if(err){
        reject(err);
    }else {
        resolve(filename)
    }
  })
})

const deleteJSON = (filename) => {
  fs.unlinkSync(path.resolve(JSON_LOAD_PATH, filename));
}

export default {
  login: async (root, { username, password }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []
    let user = {}

    try {
      if (username.indexOf('@') !== -1) {
        user = (await dataSources.database.user.selectUser({ email: username }, ['password']))[0]
      } else {
        user = (await dataSources.database.user.selectUser({ username }, ['password']))[0]
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
  loginWithEmail: async (root, { email, code, key },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []
    let user = {}

    try {
      user = (await dataSources.database.user.selectUser({ email }, ['username']))[0]
      let isValidCode = await dataSources.Email.checkCode(email, code)
      let isValidKey = await dataSources.CheckEmailKey.check(email, key)
      let isValid = user && user.username && isValidCode && isValidKey
  
      if (isValid) {
        await dataSources.Email.deleteCode(email)
        await dataSources.CheckEmailKey.delete(email)

        let token = await dataSources.jwt.sign(user.username)
  
        response = {
          token,
          username: user.username,
          isSuccess: true,
          extension: {
            operator: 'login',
            errors
          }
        }
        let cookie = `customer=${user.username};username=${user.username};path=/;Expires=${moment().add(7, 'd').format('ddd, D MMM YYYY HH:mm:SS')} GMT;Secure;HttpOnly`
        res.setHeader('Set-Cookie', cookie)
      } else {
        if (!user || !user.username) {
          errors.push({
            path: 'login.email',
            message: 'email is not exist'
          })
        }

        if (!isValidKey) {
          errors.push({
            path: 'login.email',
            message: 'code is not right'
          })
        }

        if (!isValidCode) {
          errors.push({
            path: 'login.email',
            message: 'code is not right'
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
  register: async (root, { username, nickname, avatar, gender, location, birthday, email, statement, u_key, e_key},  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let newUser = {
      username,
      nickname,
      avatar,
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
  
        let user = await dataSources.database.user.createUser(newUser)
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
  setPassword: async (root, { email, password, key },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let user = (await dataSources.database.user.selectUser({ email }, ['username']))[0]
      let isValidEKey = await dataSources.Email.AckKey.check(email, key);
      let isValid = user && isValidEKey

      if (isValid) {
        await dataSources.database.user.updateUserByEmail(email, 'password', password)
        response = {
          isSuccess: true,
          extension: {
            operator: 'setPassword',
            errors
          }
        }

        await dataSources.Email.AckKey.delete(email)
      } else {
        if (!user) {
          errors.push({
            path: 'setPassword',
            message: 'email is invalid'
          })
        }
        if (!isValidEKey) {
          errors.push({
            path: 'setPassword',
            message: 'ack key is invalid'
          })
        }
        response = {
          isSuccess: false,
          extension: {
            operator: 'setPassword',
            errors
          }
        }
      }
    } catch (err) {
      errors.push({
        path: 'setPassword',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: 'setPassword',
          errors
        }
      }
    }

    return response
  },
  checkUsername: async (root, { username },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let users = await dataSources.database.user.selectUserByUsername(username)
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
  checkUsernameValid: async (root, { username },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let users = await dataSources.database.user.selectUserByUsername(username)
      let isValid = users.length > 0

      if (isValid) {
        response = {
          isSuccess: true,
          extension: {
            operator: "check username if valid",
            errors: []
          }
        }
      } else {
        errors.push({
          path: 'checkUsernameValid',
          message: 'is not exist'
        })
        response = {
          isSuccess: false,
          extension: {
            operator: "check username if valid",
            errors
          }
        }
      }
    } catch (err) {
      errors.push({
        path: 'checkUsernameValid',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "check username if usable",
          errors
        }
      }
    }
   
    return response
  },
  sendEmailCode: async (root, { email },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []
    try {
      let users = await dataSources.database.user.selectUserByEmail(email)
      let isValid = users.length === 0 && !(await dataSources.CheckEmailKey.exists(email))

      if (isValid) {
        let info = await dataSources.Email.sendCode(email)

        if (info) {
          let key = await dataSources.CheckEmailKey.create(email)
          response = {
            key,
            isSuccess: true,
            extension: {
              operator: "check email if usable&&send email code",
              errors
            }
          }
        } else {
          errors.psuh({
            path: 'sendEmailCode.check',
            message: 'send email faliure'
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
        path: 'sendEmailCode',
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
  sendEmailLoginCode: async (root, { email },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []
    try {
      let users = await dataSources.database.user.selectUserByEmail(email)
      let isValid = users.length > 0 && !(await dataSources.CheckEmailKey.exists(email))

      if (isValid) {
        let info = await dataSources.Email.sendCode(email)

        if (info) {
          let key = await dataSources.CheckEmailKey.create(email)
          response = {
            key,
            isSuccess: true,
            extension: {
              operator: "check email if usable&&send email code",
              errors
            }
          }
        } else {
          errors.psuh({
            path: 'sendEmailCode.check',
            message: 'send email faliure'
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
      } else {
        if (users.length <= 0) {
          errors.push({
            path: 'sendEmailLoginCode',
            message: 'email is not exist'
          })
        } else {
          errors.push({
            path: 'sendEmailLoginCode',
            message: 'email has been send'
          })
        }
        
        response = {
          key: '',
          isSuccess: false,
          extension: {
            operator: "send email login code",
            errors
          }
        }
      }
    } catch(err) {
      errors.push({
        path: 'sendEmailLoginCode',
        message: JSON.stringify(err)
      })
      response = {
        key: '',
        isSuccess: false,
        extension: {
          operator: "send email login code",
          errors
        }
      }
    }

    return response
  },
  ackEmail: async (root, { email, code, key },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []
    try {
      let isValidCode = await dataSources.Email.checkCode(email, code)
      let isValidKey = await dataSources.CheckEmailKey.check(email, key)
      let isValid = isValidCode && isValidKey

      if (isValid) {
        await dataSources.Email.deleteCode(email)
        await dataSources.CheckEmailKey.delete(email)

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
  logout: async (root, { },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []
    if (sessionInfo && currentUser) {
      dataSources.jwt.stale(currentUser.username)
      currentUser.status = 0
      pubsub.publish(USER_LOGOUT, currentUser)
      response = {
        isSuccess: true,
        extension: {
          operator: 'logout',
          errors
        }
      }
    } else {
      errors.push({
        path: 'logout',
        message: 'auth info fail'
      })
      response = {
        isSuccess: false,
        extension: {
          operator: 'logout',
          errors
        }
      }
    }
    return response
  },
  uploadSingleImage: async (root, { image },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
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
  createArticle: async (root, { title, abstract, content, categoryIds, image }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
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
          if (categorys.affectedRows=== categoryIds.length) {
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
            dataSources.database.article.deleteArticleById(newArticle.id)
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
  },
  checkArticleIdValid: async (root, { id, userId },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let article = (await dataSources.database.article.selectArticlesByIds([id]))[0]

      if (article) {
        if (userId && article.user_id !== userId) {
          if (article.user_id !== userId) {
            errors.push({
              path: 'checkArticleIdValid',
              message: 'no permission'
            })
            response = {
              isSuccess: false,
              extension: {
                operator: "check article id if usable",
                errors
              }
            }
          }
        } else {
          response = {
            isSuccess: true,
            extension: {
              operator: "check article id if usable",
              errors
            }
          }
        }
      } else {
        if (!article) {
          errors.push({
            path: 'checkArticleIdValid',
            message: 'article is not exist'
          })
        }
        
        response = {
          isSuccess: false,
          extension: {
            operator: "check article id if usable",
            errors
          }
        }
      }
    } catch (err) {
      errors.push({
        path: 'checkArticleIdValid',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "check article id if usable",
          errors
        }
      }
    }

    return response
  },
  sendComment: async (root, { content, articleId },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let isValid = currentUser && sessionInfo

      if (isValid) {
        let info = await dataSources.database.comment.createComment(currentUser.id, content)
        await dataSources.database.articleComment.createArticleComments(articleId, [info.insertId])
        
        response = {
          isSuccess: true,
          extension: {
            operator: 'sendComment',
            errors
          }
        }
      } else {
        errors.push({
          path: 'sendComment',
          message: 'auth is invalid'
        })

        response = {
          sessionInfo: {
            username,
            tiken: '',
            isRefresh: false
          },
          isSuccess: false,
          extension: {
            operator: 'sendComment',
            errors
          }
        }
      }
      
      
    } catch (err) {
      errors.push({
        path: 'sendComment',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "send comment",
          errors
        }
      }
    }

    return response
  },
  articleStar: async (root, { articleId, status },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let isValid = currentUser && sessionInfo

      if (isValid) {
        if (status) {
          await dataSources.database.articleCollection.deleteArticleCollections(articleId, [currentUser.id])
        } else {
          await dataSources.database.articleCollection.createArticleCollections(articleId, [currentUser.id])
        }

        response = {
          isSuccess: true,
          extension: {
            operator: 'article star',
            errors
          }
        }
      } else {
        errors.push({
          path: 'articleStar',
          message: 'auth fail'
        })

        response = {
          isSuccess: false,
          extension: {
            operator: 'articleStar',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'articleStar',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "article star",
          errors
        }
      }
    }

    return response
  },
  articleLike: async (root, {articleId, status = false },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let isValid = currentUser && sessionInfo

      if (isValid) {
        if (status) {
          await dataSources.database.articleLike.deleteArticleLikes(articleId, [currentUser.id])
        } else {
          await dataSources.database.articleLike.createArticleLikes(articleId, [currentUser.id])
        }
        
        response = {
          isSuccess: true,
          extension: {
            operator: 'article star',
            errors
          }
        }
      } else {
        errors.push({
          path: 'articleStar',
          message: 'auth fail'
        })

        response = {
          isSuccess: false,
          extension: {
            operator: 'articleLike',
            errors
          }
        }
      }
    } catch (err) {
      errors.push({
        path: 'articleStar',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "article star",
          errors
        }
      }
    }

    return response
  },
  changeUserInfo: async (root, { email, key, nickname, location, gender, birthday, avatar, statement, eduBG, emRecords, categoryIds, industryIds, secQuestions },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let user = (await dataSources.database.user.selectUser({ email }, ['id']))[0]
      let isValidEKey = await dataSources.Email.AckKey.check(email, key);
      let isValid = currentUser && sessionInfo && user && isValidEKey && user.id == currentUser.id

      if (isValid) {
        if (nickname) {
          await dataSources.database.user.updateUserById(user.id, 'nickname', nickname)
        }
        if (location) {
          await dataSources.database.user.updateUserById(user.id, 'location', location)
        }
        if (birthday) {
          await dataSources.database.user.updateUserById(user.id, 'birthday', birthday)
        }
        if (gender) {
          await dataSources.database.user.updateUserById(user.id, 'gender', gender)
        }
        if (avatar) {
          await dataSources.database.user.updateUserById(user.id, 'avatar', avatar)
        }
        if (statement) {
          await dataSources.database.user.updateUserById(user.id, 'statement', statement)
        }
        if (eduBG && eduBG.length > 0) {
          await dataSources.database.eduBG.deleteEduBGsByUserId(user.id)
          await dataSources.database.eduBG.createEduBGs(user.id, eduBG)
        }
        if (emRecords && emRecords.length > 0) {
          await dataSources.database.emRecord.deleteEmRecordsByUserId(user.id)
          await dataSources.database.emRecord.createEmRecords(user.id, emRecords)
        }
        if (secQuestions && secQuestions.length > 0) {
          await dataSources.database.secQuestion.deleteUserSecQuestionByUserId(user.id)
          await dataSources.database.secQuestion.createSecQuestions(user.id, secQuestions)
        }
        if (categoryIds.length > 0) {
          await dataSources.database.userCategory.deleteUserCategorysByUserId(user.id)
          await dataSources.database.userCategory.createUserCategorys(user.id, categoryIds)
        }
        if (industryIds.length > 0) {
          await dataSources.database.userIndustry.deleteUserIndustrysByUserId(user.id)
          await dataSources.database.userIndustry.createUserIndustrys(user.id, industryIds)
        }

        response = {
          isSuccess: true,
          extension: {
            operator: 'changeUserInfo',
            errors
          }
        }
      } else {
        if (!user || !sessionInfo) {
          errors.push({
            path: 'createArticle',
            message: 'auth fail'
          })
        }
        if (!isValidEKey) {
          errors.push({
            path: 'changeUserInfo',
            message: 'ack key is invalid'
          })
        }
        response = {
          isSuccess: false,
          extension: {
            operator: 'changeUserInfo',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'changeUserInfo',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "change user info",
          errors
        }
      }
    }

    return response
  },
  userConcern: async (root, {userId, status },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let isValid = currentUser && sessionInfo

      if (isValid) {
        if (status) {
          await dataSources.database.userConcerned.deleteUserConcerned(currentUser.id, userId)
        } else {
          await dataSources.database.userConcerned.createUserConcerneds(currentUser.id, [userId])
        }
        
        response = {
          isSuccess: true,
          extension: {
            operator: 'user concern',
            errors
          }
        }
      } else {
        errors.push({
          path: 'userConcern',
          message: 'auth fail'
        })

        response = {
          isSuccess: false,
          extension: {
            operator: 'userConcern',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'userConcern',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "user concern",
          errors
        }
      }
    }

    return response
  },
  categoryStar: async (root, { categoryId, status },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let isValid = currentUser && sessionInfo

      if (isValid) {
        if (status) {
          await dataSources.database.userCategory.deleteUserCategorys(currentUser.id, categoryId)
        } else {
          await dataSources.database.userCategory.createUserCategorys(currentUser.id, [categoryId])
        }
        
        response = {
          isSuccess: true,
          extension: {
            operator: 'category star',
            errors
          }
        }
      } else {
        errors.push({
          path: 'categoryStar',
          message: 'auth fail'
        })

        response = {
          isSuccess: false,
          extension: {
            operator: 'categoryStar',
            errors
          }
        }
      }
    } catch (err) {
      errors.push({
        path: 'categoryStar',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "category star",
          errors
        }
      }
    }

    return response
  },
  industryStar: async (root, { industryId, status },  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let isValid = currentUser && sessionInfo

      if (isValid) {
        if (status) {
          await dataSources.database.userIndustry.deleteUserIndustry(currentUser.id, industryId)
        } else {
          await dataSources.database.userIndustry.createUserIndustrys(currentUser.id, [industryId])
        }
        
        response = {
          isSuccess: true,
          extension: {
            operator: 'industry star',
            errors
          }
        }
      } else {
        errors.push({
          path: 'industryStar',
          message: 'auth fail'
        })
        

        response = {
          isSuccess: false,
          extension: {
            operator: 'industryStar',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'industryStar',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "industry star",
          errors
        }
      }
    }

    return response
  },
  sendMessage: async (root, { userId, message},  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info ) => {
    let response = {}
    let errors = []

    try {
      let acceptUser = (await dataSources.database.user.selectUser({ id: userId }, []))[0]
      let isValid = !!sessionInfo && currentUser && acceptUser

      if (isValid) {
        let info = await dataSources.database.message.createMessage(currentUser.id, userId, message)
        if (info) {
          let messageObj = (await dataSources.database.message.selectMeesageById(info.insertId))[0]
          messageObj.acceptUser = acceptUser
          messageObj.sendUser = currentUser
          pubsub.publish(NEW_MESSAGE, messageObj)

          response = {
            isSuccess: true,
            extension: {
              operator: "send message",
              errors
            }
          }
        } else {
          errors.push({
            path: 'sendMessage',
            message: 'server error'
          })
        }
      } else {
        if (!user || !sessionInfo) {
          errors.push({
            path: 'sendMessage',
            message: 'auth fail'
          })
        }

        if (!acceptUser) {
          errors.push({
            path: 'sendMessage.userId',
            message: 'accept user is not exist'
          })
        }

        response = {
          isSuccess: false,
          extension: {
            operator: 'sendMessage',
            errors
          }
        }
      }

    } catch (err) {
      console.log(err)
      errors.push({
        path: 'sendMessage',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "send message",
          errors
        }
      }
    }

    return response
  },
  commentLike: async (root, { commentId, status},  { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info ) => {
    let response = {}
    let errors = []

    try {
      let isValid = currentUser && sessionInfo

      if (isValid) {
        if (status) {
          await dataSources.database.commentLike.deleteCommentslike(currentUser.id, commentId)
        } else {
          await dataSources.database.commentLike.createCommentsLike(currentUser.id, commentId)
        }
        
        response = {
          isSuccess: true,
          extension: {
            operator: 'commentLike',
            errors
          }
        }
      } else {
        errors.push({
          path: 'commentLike',
          message: 'auth fail'
        })
        

        response = {
          isSuccess: false,
          extension: {
            operator: 'commentLike',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'commentLike',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "commentLike",
          errors
        }
      }
    }

    return response
  },
  editArticle: async (root, { id, title, abstract, content, categoryIds, image }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
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
        let contentName = await writeJSONSync(content)
        let newArticle = {
          title,
          abstract,
          user_id: currentUser.id,
          content: contentName,
          image,
          id
        }

        newArticle = await dataSources.database.article.updateArticle(newArticle)

        if (newArticle) {
          await dataSources.database.articleCategory.deleteArticleCategorysByArticleId(id)
          let categorys = await dataSources.database.articleCategory.createArticleCategorys(id, categoryIds)
          if (categorys.affectedRows=== categoryIds.length) {
            response = {
              article: newArticle,
              isSuccess: true,
              extension: {
                operator: 'editArticle',
                errors
              }
            }
          } else {
            dataSources.database.article.deleteArticleById(newArticle.id)
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
  },
}
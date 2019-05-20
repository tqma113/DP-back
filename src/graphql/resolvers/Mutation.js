import moment from 'moment'
import fs from 'fs'
import path from 'path'
import getPubSub from './PubSub'

import { NEW_MESSAGE, USER_LOGOUT, NEW_ARTICLE } from './events'

const IMAGE_LOAD_PATH = __dirname + '/../../public/image'
const JSON_LOAD_PATH = __dirname + '/../../public/JSON'

const pubsub = getPubSub()

const getRandomFilename = (mimetype) => {
  const all = 'qwertyuiopasdfghjklzxcvbnm-1234567890'
  let filename = ''
  let suffix = '.' + mimetype.split('/')[1]

  for(let i = 0;i < 36;i++) {
    filename += all[parseInt(Math.random() * (all.length - 1))]
  }

  return filename + suffix
}

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

const writeJSONSync = (buffer, fname) => new Promise((resolve, reject) => {
  let filename = fname || getRandomFilenameWithSuffix('.json')

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
  applyAdmin: async (root, { reason }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let isValid = currentUser && sessionInfo && reason

      if (isValid) {
        await dataSources.database.applyAdmin.createApplyAdmins(currentUser.id, reason)

        response = {
          isSuccess: true,
          extension: {
            operator: 'applyAdmin',
            errors
          }
        }
      } else {
        if (!currentUser || !sessionInfo) {
          errors.push({
            path: 'applyAdmin',
            message: 'auth fail'
          })
        }

        if (!reason) {
          errors.push({
            path: 'applyAdmin',
            message: 'reason is null'
          })
        }
        

        response = {
          isSuccess: false,
          extension: {
            operator: 'applyAdmin',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'applyAdmin',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "applyAdmin",
          errors
        }
      }
    }

    return response
  },
  applyAddCategory: async (root, { subject, description, image }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let isValid = currentUser && sessionInfo && subject && description

      if (isValid) {
        let category = {
          subject,
          description,
          image
        }
        await dataSources.database.applyAddCategory.createApplyAddCategory(currentUser.id, category)
        
        response = {
          isSuccess: true,
          extension: {
            operator: 'applyAddCategory',
            errors
          }
        }
      } else {
        if (!currentUser || !sessionInfo) {
          errors.push({
            path: 'applyAddCategory',
            message: 'auth fail'
          })
        } else {
          errors.push({
            path: 'applyAddCategory',
            message: 'category format fail'
          })
        }
        

        response = {
          isSuccess: false,
          extension: {
            operator: 'applyAddCategory',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'applyAddCategory',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "applyAddCategory",
          errors
        }
      }
    }

    return response
  },
  applyAddIndustry: async (root, { name, description, image }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let isValid = currentUser && sessionInfo && name && description

      if (isValid) {
        let category = {
          name,
          description,
          image
        }
        await dataSources.database.applyAddIndustry.createApplyAddIndustry(currentUser.id, category)
        
        response = {
          isSuccess: true,
          extension: {
            operator: 'applyAddIndustry',
            errors
          }
        }
      } else {
        if (!currentUser || !sessionInfo) {
          errors.push({
            path: 'applyAddIndustry',
            message: 'auth fail'
          })
        } else {
          errors.push({
            path: 'applyAddIndustry',
            message: 'category format fail'
          })
        }
        

        response = {
          isSuccess: false,
          extension: {
            operator: 'applyAddIndustry',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'applyAddIndustry',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "applyAddIndustry",
          errors
        }
      }
    }

    return response
  },
  changeApplyAdmin: async (root, { id, reason }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let applyAdmin
      if (id && typeof id === 'number') {
        applyAdmin = (await dataSources.database.applyAdmin.selectApplyAdminsById(id))[0]
      }
      let isValid = currentUser && sessionInfo && applyAdmin && reason && applyAdmin.user_id == currentUser.id

      if (isValid) {
        await dataSources.database.applyAdmin.updateApplyAdmins(id, 'reason',reason)

        response = {
          isSuccess: true,
          extension: {
            operator: 'changeApplyAdmin',
            errors
          }
        }
      } else {
        if (!currentUser || !sessionInfo) {
          errors.push({
            path: 'changeApplyAdmin',
            message: 'auth fail'
          })
        }

        if (!id) {
          errors.push({
            path: 'changeApplyAdmin',
            message: 'id is null'
          })
        }

        if (!reason) {
          errors.push({
            path: 'changeApplyAdmin',
            message: 'reason is null'
          })
        }
        
        if (applyAdmin.user_id != currentUser.id) {
          errors.push({
            path: 'changeApplyAdmin',
            message: 'you have no permission'
          })
        }

        response = {
          isSuccess: false,
          extension: {
            operator: 'changeApplyAdmin',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'changeApplyAdmin',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "changeApplyAdmin",
          errors
        }
      }
    }

    return response
  },
  changeApplyAddCategory: async (root, { id, subject, description, image }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let applyAddCategory
      if (id && typeof id === 'number') {
        applyAddCategory = (await dataSources.database.applyAddCategory.selectApplyAddCategorysById(id))[0]
      }
      let isValid = currentUser && sessionInfo && applyAddCategory && reason && applyAddCategory.user_id == currentUser.id

      if (isValid) {
        if (subject) await dataSources.database.applyAddCategory.updateApplyAddCategory(id, 'subject', subject)
        if (description) await dataSources.database.applyAddCategory.updateApplyAddCategory(id, 'description', description)
        if (image) await dataSources.database.applyAddCategory.updateApplyAddCategory(id, 'image', image)

        response = {
          isSuccess: true,
          extension: {
            operator: 'changeApplyAddCategory',
            errors
          }
        }
      } else {
        if (!currentUser || !sessionInfo) {
          errors.push({
            path: 'changeApplyAddCategory',
            message: 'auth fail'
          })
        }

        if (!id) {
          errors.push({
            path: 'changeApplyAddCategory',
            message: 'id is null'
          })
        }

        if (!reason) {
          errors.push({
            path: 'changeApplyAddCategory',
            message: 'reason is null'
          })
        }
        
        if (applyAddCategory.user_id != currentUser.id) {
          errors.push({
            path: 'changeApplyAddCategory',
            message: 'you have no permission'
          })
        }

        response = {
          isSuccess: false,
          extension: {
            operator: 'changeApplyAddCategory',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'changeApplyAddCategory',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "changeApplyAddCategory",
          errors
        }
      }
    }

    return response
  },
  changeApplyAddIndustry: async (root, { id, name, description, image }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let applyAddIndustry
      if (id && typeof id === 'number') {
        applyAddIndustry = (await dataSources.database.applyAddIndustry.selectApplyAddIndustryById(id))[0]
      }
      let isValid = currentUser && sessionInfo && applyAddIndustry && reason && applyAddIndustry.user_id == currentUser.id

      if (isValid) {
        if (name) await dataSources.database.applyAddIndustry.updateApplyAddIndustry(id, 'name', name)
        if (description) await dataSources.database.applyAddIndustry.updateApplyAddIndustry(id, 'description', description)
        if (image) await dataSources.database.applyAddIndustry.updateApplyAddIndustry(id, 'image', image)

        response = {
          isSuccess: true,
          extension: {
            operator: 'changeApplyAddIndustry',
            errors
          }
        }
      } else {
        if (!currentUser || !sessionInfo) {
          errors.push({
            path: 'changeApplyAddIndustry',
            message: 'auth fail'
          })
        }

        if (!id) {
          errors.push({
            path: 'changeApplyAddIndustry',
            message: 'id is null'
          })
        }

        if (!reason) {
          errors.push({
            path: 'changeApplyAddIndustry',
            message: 'reason is null'
          })
        }
        
        if (applyAddIndustry.user_id != currentUser.id) {
          errors.push({
            path: 'changeApplyAddIndustry',
            message: 'you have no permission'
          })
        }

        response = {
          isSuccess: false,
          extension: {
            operator: 'changeApplyAddIndustry',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'changeApplyAddIndustry',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "changeApplyAddIndustry",
          errors
        }
      }
    }

    return response
  },
  dealApplyAdmin: async (root, { id, status }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let applyAdmin
      if (id && typeof id === 'number') {
        applyAdmin = (await dataSources.database.applyAdmin.selectApplyAdminsById(id))[0]
      }
      let isValid = currentUser && sessionInfo && applyAdmin && currentUser.user_type == 1

      if (isValid) {
        await dataSources.database.applyAdmin.updateApplyAdmins(id, 'deal_user_id', currentUser.id)
        await dataSources.database.applyAdmin.updateApplyAdmins(id, 'deal_time', (new Date()).getTime())
        await dataSources.database.applyAdmin.updateApplyAdmins(id, 'status', status)

        if (status == '1') {
          await dataSources.database.user.updateUserById(applyAdmin.user_id, 'user_type', 1)
        }

        response = {
          isSuccess: true,
          extension: {
            operator: 'dealApplyAdmin',
            errors
          }
        }
      } else {
        if (!currentUser || !sessionInfo) {
          errors.push({
            path: 'dealApplyAdmin',
            message: 'auth fail'
          })
        }

        if (!status) {
          errors.push({
            path: 'dealApplyAdmin',
            message: 'status is null'
          })
        }
        
        if (applyAdmin.user_id != currentUser.id) {
          errors.push({
            path: 'dealApplyAdmin',
            message: 'you have no permission'
          })
        }

        response = {
          isSuccess: false,
          extension: {
            operator: 'dealApplyAdmin',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'dealApplyAdmin',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "dealApplyAdmin",
          errors
        }
      }
    }

    return response
  },
  dealApplyAddCategory: async (root, { id, status }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let applyAddCategory
      if (id && typeof id === 'number') {
        applyAddCategory = (await dataSources.database.applyAddCategory.selectApplyAddCategorysById(id))[0]
      }
      let isValid = currentUser && sessionInfo && applyAddCategory && currentUser.user_type == '1'

      if (isValid) {
        await dataSources.database.applyAddCategory.updateApplyAddCategory(id, 'deal_user_id', currentUser.id)
        await dataSources.database.applyAddCategory.updateApplyAddCategory(id, 'deal_time', (new Date()).getTime())
        await dataSources.database.applyAddCategory.updateApplyAddCategory(id, 'status', status)

        if (status == '1') {
          await dataSources.database.category.createCategory([applyAddCategory])
        }

        response = {
          isSuccess: true,
          extension: {
            operator: 'dealApplyAddCategory',
            errors
          }
        }
      } else {
        if (!currentUser || !sessionInfo) {
          errors.push({
            path: 'dealApplyAddCategory',
            message: 'auth fail'
          })
        }

        
        if (currentUser.user_type != '1') {
          errors.push({
            path: 'dealApplyAddCategory',
            message: 'you have no permission'
          })
        }

        response = {
          isSuccess: false,
          extension: {
            operator: 'dealApplyAddCategory',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'dealApplyAddCategory',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "dealApplyAddCategory",
          errors
        }
      }
    }

    return response
  },
  dealApplyAddIndustry: async (root, { id, status }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let applyAddIndustry
      if (id && typeof id === 'number') {
        applyAddIndustry = (await dataSources.database.applyAddIndustry.selectApplyAddIndustryById(id))[0]
      }
      let isValid = currentUser && sessionInfo && applyAddIndustry && currentUser.user_type == '1'

      if (isValid) {
        await dataSources.database.applyAddIndustry.updateApplyAddCategory(id, 'deal_user_id', currentUser.id)
        await dataSources.database.applyAddIndustry.updateApplyAddCategory(id, 'deal_time', (new Date()).getTime())
        await dataSources.database.applyAddIndustry.updateApplyAddCategory(id, 'status', status)

        if (status == '1') {
          await dataSources.database.industry.createIndustrys([applyAddIndustry])
        }

        response = {
          isSuccess: true,
          extension: {
            operator: 'dealApplyAddIndustry',
            errors
          }
        }
      } else {
        if (!currentUser || !sessionInfo) {
          errors.push({
            path: 'dealApplyAddIndustry',
            message: 'auth fail'
          })
        }
        
        if (currentUser.user_type != '1') {
          errors.push({
            path: 'dealApplyAddIndustry',
            message: 'you have no permission'
          })
        }
        
        if (applyAddCategory.user_id != currentUser.id) {
          errors.push({
            path: 'dealApplyAddIndustry',
            message: 'you have no permission'
          })
        }

        response = {
          isSuccess: false,
          extension: {
            operator: 'dealApplyAddIndustry',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'dealApplyAddIndustry',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "dealApplyAddIndustry",
          errors
        }
      }
    }

    return response
  },
  addAdmin: async (root, { id, status }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let user
      if (id && typeof id === 'number') {
        user = (await dataSources.database.user.selectUserById(id))[0]
      }
      let isValid = currentUser && sessionInfo && user && currentUser.user_type == 1

      if (isValid) {
        await dataSources.database.user.updateUserById(id, 'user_type', 1)

        response = {
          isSuccess: true,
          extension: {
            operator: 'addAdmin',
            errors
          }
        }
      } else {
        if (!currentUser || !sessionInfo) {
          errors.push({
            path: 'addAdmin',
            message: 'auth fail'
          })
        }

        if (!status) {
          errors.push({
            path: 'addAdmin',
            message: 'status is null'
          })
        }
        
        if (applyAdmin.user_id != currentUser.id) {
          errors.push({
            path: 'addAdmin',
            message: 'you have no permission'
          })
        }

        response = {
          isSuccess: false,
          extension: {
            operator: 'addAdmin',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'addAdmin',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "addAdmin",
          errors
        }
      }
    }

    return response
  },
  addCategory: async (root, { subject, description, image }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let isValid = currentUser && sessionInfo && currentUser.user_type == '1'

      if (isValid) {
        let category = {
          subject,
          description,
          image
        }
        await dataSources.database.category.createCategorys([category])

        response = {
          isSuccess: true,
          extension: {
            operator: 'addCategory',
            errors
          }
        }
      } else {
        if (!currentUser || !sessionInfo) {
          errors.push({
            path: 'addCategory',
            message: 'auth fail'
          })
        }

        
        if (currentUser.user_type != '1') {
          errors.push({
            path: 'addCategory',
            message: 'you have no permission'
          })
        }

        response = {
          isSuccess: false,
          extension: {
            operator: 'addCategory',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'addCategory',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "addCategory",
          errors
        }
      }
    }

    return response
  },
  addIndustry: async (root, { name, description, image }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
    let response = {}
    let errors = []

    try {
      let applyAddIndustry
      if (id && typeof id === 'number') {
        applyAddIndustry = (await dataSources.database.applyAddIndustry.selectApplyAddIndustryById(id))[0]
      }
      let isValid = currentUser && sessionInfo && applyAddIndustry && currentUser.user_type == '1'

      if (isValid) {
        let industry = {
          name,
          description,
          image
        }
        await dataSources.database.industry.createIndustrys([industry])

        response = {
          isSuccess: true,
          extension: {
            operator: 'addIndustry',
            errors
          }
        }
      } else {
        if (!currentUser || !sessionInfo) {
          errors.push({
            path: 'addIndustry',
            message: 'auth fail'
          })
        }
        
        if (currentUser.user_type != '1') {
          errors.push({
            path: 'addIndustry',
            message: 'you have no permission'
          })
        }
        
        if (applyAddCategory.user_id != currentUser.id) {
          errors.push({
            path: 'addIndustry',
            message: 'you have no permission'
          })
        }

        response = {
          isSuccess: false,
          extension: {
            operator: 'addIndustry',
            errors
          }
        }
      }
    } catch (err) {
      console.log(err)
      errors.push({
        path: 'addIndustry',
        message: JSON.stringify(err)
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "addIndustry",
          errors
        }
      }
    }

    return response
  },
}
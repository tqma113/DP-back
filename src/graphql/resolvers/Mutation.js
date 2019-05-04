import { PubSub, withFilter } from 'apollo-server';
import moment from 'moment'
import fs from 'fs'
import path from 'path'

const USER_ADDED = 'USER_ADDED';
const USER_UPDATED = 'USER_UPDATED';
const USER_DELETED = 'USER_DELETED';

const IMAGE_LOAD_PATH = __dirname + '/../../public/image'
const JSON_LOAD_PATH = __dirname + '/../../public/JSON'

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

export default {
  login: async (root, { username, password }, { dataSources, res }, info) => {
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
  loginWithEmail: async (root, { email, code, key }, { dataSources, res }, info) => {
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
  register: async (root, { username, nickname, avatar, gender, location, birthday, email, statement, u_key, e_key}, { dataSources }, info) => {
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
  setPassword: async (root, { email, password, key }, { dataSources }, info) => {
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
  checkUsername: async (root, { username }, { dataSources }, info) => {
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
  checkUsernameValid: async (root, { username }, { dataSources }, info) => {
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
  sendEmailCode: async (root, { email }, { dataSources }, info) => {
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
  sendEmailLoginCode: async (root, { email }, { dataSources }, info) => {
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
  ackEmail: async (root, { email, code, key }, { dataSources }, info) => {
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
  createArticle: async (root, { title, abstract, content, username, token, categoryIds }, { dataSources }, info) => {
    let response = {}
    let errors = []

    try {
      let user = (await dataSources.database.user.selectUser({ username }, []))[0]
      let sessionInfo = await dataSources.jwt.verify(username, token)
      let isValid = !!sessionInfo && user && title && abstract && content && true

      if (isValid) {
        let contentName = await writeJSONSync(content)
        let article = {
          title,
          abstract,
          user_id: user.id,
          content: contentName
        }

        let newArticle = await dataSources.database.article.createArticle(article)

        if (newArticle) {

          let categorys = await dataSources.database.articleCategory.createArticleCategorys(newArticle.id, categoryIds)
          if (categorys.affectedRows=== categoryIds.length) {
            newArticle.user = user
            newArticle.project_link = []
            newArticle.category = categoryIds
            newArticle.industrys = []
            newArticle.comments = []
            newArticle.likes = 0
            newArticle.collections = 0
    
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
              article: {},
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
            article: {},
            isSuccess: false,
            extension: {
              operator: "create article",
              errors
            }
          }
        }
      } else {
        if (!user) {
          errors.push({
            path: 'createArticle.username',
            message: 'username is not exist'
          })
        }
        
        if (!sessionInfo) {
          errors.push({
            path: 'createArticle.token',
            message: 'token is invalid'
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
          article: {},
          isSuccess: false,
          extension: {
            operator: 'createArticle',
            errors
          }
        }
      }

    } catch (err) {
      errors.push({
        path: 'createArticle',
        message: JSON.stringify(err)
      })

      response = {
        article: {},
        isSuccess: false,
        extension: {
          operator: "create article",
          errors
        }
      }
    }

    return response
  },
  checkArticleIdValid: async (root, { id }, { dataSources }, info) => {
    let response = {}
    let errors = []

    try {
      let article = (await dataSources.database.article.selectArticlesByIds([id]))[0]

      if (article) {
        response = {
          isSuccess: true,
          extension: {
            operator: "check article id if usable",
            errors
          }
        }
      } else {
        errors.push({
          path: 'checkArticleIdValid',
          message: 'article is not exist'
        })
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
  sendComment: async (root, { username, token, content, articleId }, { dataSources }, info) => {
    let response = {}
    let errors = []

    try {
      let user = (await dataSources.database.user.selectUser({ username }, ['id']))[0]
      let sessionInfo = await dataSources.jwt.verify(username, token)
      let isValid = !!sessionInfo && user

      if (isValid) {
        let info = await dataSources.database.comment.createComment(user.id, content)
        await dataSources.database.articleComment.createArticleComments(articleId, [info.insertId])
        
        response = {
          isSuccess: true,
          extension: {
            operator: 'sendComment',
            errors
          }
        }
      } else {
        if (!user) {
          errors.push({
            path: 'sendComment.username',
            message: 'username is not exist'
          })
        }
        
        if (!sessionInfo) {
          errors.push({
            path: 'sendComment.token',
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
  articleStar: async (root, { username, token, articleId, status }, { dataSources }, info) => {
    let response = {}
    let errors = []

    try {
      let user = (await dataSources.database.user.selectUser({ username }, ['id']))[0]
      let sessionInfo = await dataSources.jwt.verify(username, token)
      let isValid = !!sessionInfo && user

      if (isValid) {
        if (status) {
          await dataSources.database.articleCollection.deleteArticleCollections(articleId, [user.id])
        } else {
          await dataSources.database.articleCollection.createArticleCollections(articleId, [user.id])
        }

        response = {
          isSuccess: true,
          extension: {
            operator: 'article star',
            errors
          }
        }
      } else {
        if (!user) {
          errors.push({
            path: 'articleStar.username',
            message: 'username is not exist'
          })
        }
        
        if (!sessionInfo) {
          errors.push({
            path: 'articleStar.token',
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
  articleLike: async (root, { username, token, articleId, status = false }, { dataSources }, info) => {
    let response = {}
    let errors = []

    try {
      let user = (await dataSources.database.user.selectUser({ username }, ['id']))[0]
      let sessionInfo = await dataSources.jwt.verify(username, token)
      let isValid = !!sessionInfo && user

      if (isValid) {
        if (status) {
          await dataSources.database.articleLike.deleteArticleLikes(articleId, [user.id])
        } else {
          await dataSources.database.articleLike.createArticleLikes(articleId, [user.id])
        }
        
        response = {
          isSuccess: true,
          extension: {
            operator: 'article star',
            errors
          }
        }
      } else {
        if (!user) {
          errors.push({
            path: 'articleLike.username',
            message: 'username is not exist'
          })
        }
        
        if (!sessionInfo) {
          errors.push({
            path: 'articleLike.token',
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
  changeUserInfo: async (root, { email, key, nickname, location, gender, birthday, avatar, statement, eduBG, emRecords, categoryIds, industryIds, secQuestions }, { dataSources }, info) => {
    let response = {}
    let errors = []

    try {
      let user = (await dataSources.database.user.selectUser({ email }, ['id']))[0]
      let isValidEKey = await dataSources.Email.AckKey.check(email, key);
      let isValid = user && isValidEKey

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
          await dataSources.database.eduBG.createEduBGs(user.id, secQuestions)
        }
        if (emRecords && emRecords.length > 0) {
          await dataSources.database.emRecord.deleteEmRecordsByUserId(user.id)
          await dataSources.database.emRecord.createEmRecords(user.id, secQuestions)
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
        if (!user) {
          errors.push({
            path: 'changeUserInfo',
            message: 'email is invalid'
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
  userConcern: async (root, { username, token, userId, status }, { dataSources }, info) => {
    let response = {}
    let errors = []

    try {
      let user = (await dataSources.database.user.selectUser({ username }, ['id']))[0]
      let sessionInfo = await dataSources.jwt.verify(username, token)
      let isValid = !!sessionInfo && user

      if (isValid) {
        if (status) {
          await dataSources.database.userConcerned.deleteUserConcerned(user.id, userId)
        } else {
          await dataSources.database.userConcerned.createUserConcerneds(user.id, [userId])
        }
        
        response = {
          isSuccess: true,
          extension: {
            operator: 'user concern',
            errors
          }
        }
      } else {
        if (!user) {
          errors.push({
            path: 'userConcern.username',
            message: 'username is not exist'
          })
        }
        
        if (!sessionInfo) {
          errors.push({
            path: 'userConcern.token',
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
  }
}
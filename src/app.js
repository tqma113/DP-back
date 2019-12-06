import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import typeDefs from './graphql/schema'
import resolvers from './graphql/resolvers'
import fs from 'fs'
import https from 'https'
import http from 'http'
import path from 'path'
import morgan from 'morgan'
import rfs from 'rotating-file-stream'
import child_process from 'child_process'
// import cors from'cors'
// import multer from 'multer'
// import { listenerCount } from 'cluster';

import database from './database';
import getPubSub from './graphql/resolvers/PubSub'
import { NEW_USER_LOGIN, USER_LOGOUT } from './graphql/resolvers/events'

import CheckUsernameKey from './key/check_username';
import CheckEmailKey from './key/check_email'

import Email from './email/index'
import jwt from './jwt/index'

const configurations = {
  // Note: You may need sudo to run on port 443
  development: { ssl: false, port: 4000, hostname: 'localhost' },
  production: { ssl: false, port: 443, hostname: 'www.matianqi.com' }
}

const environment = process.env.NODE_ENV || 'production'
const config = configurations[environment]

// 跨域配置信息
const corsOptions = {
  origin: 'http://matianqi.com',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}

const redisClear = './src/redis/clear.js'
const pubsub = getPubSub()

const queryAsync = async (i) => {
  i.industrys =  (await database.userIndustry.selectUserIndustrysByUserId(i.id)).map(item => item.industry_id)
  i.eduBG = await database.eduBG.selectEduBGsByUserId(i.id)
  i.emRecords = await database.emRecord.selectEmRecordsByUserId(i.id)
  i.articles = await database.article.selectArticlesByUserIds([i.id])
  i.categorys = (await database.userCategory.selectUserCategorysByUserId(i.id)).map(item => item.category_id)
  i.concerned = await database.userConcerned.selectUserConcernedsByUserId(i.id)
  i.concern = await database.userConcerned.selectUserConcernedsByConcernedUserId(i.id)
  i.likes = await database.articleLike.selectArticleLikesByUserId(i.id)
  i.collections = await database.articleCollection.selectArticleCollectionsByUserId(i.id)
  i.dynamics = []
  return i
}

const apollo = new ApolloServer({ 
  typeDefs, 
  resolvers,
  subscriptions: {
    path: '/subscriptions',
    // keepAlive: 20,
    onConnect: (connectionParams, webSocket, context) => {
      // GraphQL鉴权
      if (connectionParams.authToken && connectionParams.username) {

        try {
          return jwt.verify(connectionParams.username, connectionParams.authToken)
            .then(info => {
              if (info) {
                return database.user.selectUsersByUsernames([connectionParams.username])
                .then(users => {
                  return queryAsync(users[0])
                  .then((user) => {
                    if (user.statue === 0) {
                      database.user.updateUserById(user.id, 'status', 1)
                      user.status = 1
                    }
                    pubsub.publish(NEW_USER_LOGIN, user)
                    return ({
                      currentUser: users[0],
                      sessionInfo: info
                    })
                  })
                })
              }
              throw new Error('Missing auth token!');
            });

        } catch(err) {
          throw new Error('Missing auth token!', err);
        }
      }

      console.log('Missing auth token');
    },
    onDisconnect: async (webSocket, context) => {
      // 
      try {
        let info = await context.initPromise
        if (info && info.user) {
          database.user.updateUserById(info.user.id, 'status', 0)
          user.status = 0
          pubsub.publish(USER_LOGOUT, user)
        } else {
          console.log('disconnected without auth')
        }
      } catch (err) {
        console.log(err)
      }
    }
  },
  tracing: true,
  cacheControl: {
    // defaultMaxAge: 5,
    // stripFormattedExtensions: false,
    // calculateCacheControlHeaders: false,
  },
  introspection: true,
  playground: {
    endpoint: '/playground',
    subscriptionEndpoint: '/playgroundSubscriptions'
  },
  formatError: error => {
    // TODO Error handle
    // console.log(error);
    return error;
  },
  formatResponse: response => {
    // TODO Something need to do
    // console.log(response);
    return response;
  },
  context: async ({req, res, connection}) => {

    if (connection) {
      return connection.context
    }
    let user = false
    let info = false
    let errors = []

    let token = (req && req.headers && req.headers.authorization) || ''
    let username = (req && req.headers && req.headers.username) || ''
    try {
      info = await jwt.verify(username, token)
      if (info) {
        user = (await database.user.selectUser({ username }, []))[0]
      }
    } catch (err) {
      console.log(err)
      errors = [err]
    }
    return { res, req, errors, currentUser: user, sessionInfo: info }
  },
  dataSources: () => {
    return {
      database,
      jwt,
      Email,
      CheckEmailKey,
      CheckUsernameKey
    }
  },
  rootValue: (documentAST) => {
    return {}
  },
  cors: corsOptions
})

const app = express()


// // 支持跨域
// app.use(cors(corsOptions));

// var createFolder = function(folder){
//   try{
//       fs.accessSync(folder); 
//   }catch(e){
//       fs.mkdirSync(folder);
//   }  
// };

// var uploadFolder = './upload/';

// createFolder(uploadFolder);

// // 通过 filename 属性定制
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//       cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
//   },
//   filename: function (req, file, cb) {
//       // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
//       cb(null, file.fieldname + '-' + Date.now());  
//   }
// });

// // 通过 storage 选项来对 上传行为 进行定制化
// var upload = multer({ storage: storage })

// // 单图上传
// app.post('/upload', upload.single('logo'), function(req, res, next){
//   var file = req.file;
//   res.send({ret_code: '0'});
// });

// app.use(jwt({
//   secret: 'hello world !',
//   credentialsRequired: false,
//   getToken: function fromHeaderOrQuerystring (req) {
//     if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
//         return req.headers.authorization.split(' ')[1];
//     } else if (req.query && req.query.token) {
//       return req.query.token;
//     }
//     return null;
//   }
// }))

app.use('/assets', express.static(path.join(__dirname, 'public')))

// create a rotating write stream
var accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log')
})

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))

apollo.applyMiddleware({ app })

// Create the HTTPS or HTTP server, per configuration
var server
if (config.ssl) {
  // Assumes certificates are in .ssl folder from package root. Make sure the files
  // are secured.
  server = https.createServer(
    {
      key: fs.readFileSync(`./src/ssl/${environment}/server.key`),
      cert: fs.readFileSync(`./src/ssl/${environment}/server.crt`)
    },
    app
  )
} else {
  server = http.createServer(app)
}

// Add subscription support
apollo.installSubscriptionHandlers(server)

// Start redis clear
// const redisClearProcess = child_process.fork(redisClear)
// redisClearProcess.on('message', (message) => {
//   console.log('[Redis]', message)
// })

server.listen({ port: config.port }, () => {
  console.log(
    '[Main] Server ready at',
    `http${config.ssl ? 's' : ''}://${config.hostname}:${config.port}${apollo.graphqlPath}`
  )
  console.log(`[Main] Subscriptions ready at ws${config.ssl ? 's' : ''}://${config.hostname}:${config.port}${apollo.subscriptionsPath}`)
})
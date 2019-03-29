import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import typeDefs from './graphql/schema'
import resolvers from './graphql/resolvers'
import fs from 'fs'
import https from 'https'
import http from 'http'
import cors from'cors'
import multer from 'multer'

import session from './session'

import {
  user
} from './database';

const configurations = {
  // Note: You may need sudo to run on port 443
  development: { ssl: false, port: 4000, hostname: 'localhost' },
  production: { ssl: true, port: 443, hostname: 'www.matianqi.com' }
}

const environment = process.env.NODE_ENV || 'production'
const config = configurations[environment]

const apollo = new ApolloServer({ 
  typeDefs, 
  resolvers,
  subscriptions: {
    onConnect: (connectionParams, webSocket) => {
      if (connectionParams.authToken) {
        return validateToken(connectionParams.authToken)
          .then(findUser(connectionParams.authToken))
          .then(user => {
            return {
              currentUser: user,
            };
          });
      }

      throw new Error('Missing auth token!');
    },
  },
  tracing: true,
  cacheControl: {
    // defaultMaxAge: 5,
    // stripFormattedExtensions: false,
    // calculateCacheControlHeaders: false,
  },
  introspection: true,
  playground: true,
  formatError: error => {
    console.log(error);
    return error;
  },
  formatResponse: response => {
    console.log(response);
    return response;
  },
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    console.log(token)
  },
  dataSources: () => {
    return {
      user
    }
  }
})

const app = express()

// 跨域配置信息
const corsOptions = {
  origin: 'https://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}

// 支持跨域
app.use(cors(corsOptions));

var createFolder = function(folder){
  try{
      fs.accessSync(folder); 
  }catch(e){
      fs.mkdirSync(folder);
  }  
};

var uploadFolder = './upload/';

createFolder(uploadFolder);

// 通过 filename 属性定制
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
  },
  filename: function (req, file, cb) {
      // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
      cb(null, file.fieldname + '-' + Date.now());  
  }
});

// 通过 storage 选项来对 上传行为 进行定制化
var upload = multer({ storage: storage })

// 单图上传
app.post('/upload', upload.single('logo'), function(req, res, next){
  var file = req.file;
  res.send({ret_code: '0'});
});

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

server.listen({ port: config.port }, () => {
  console.log(
    '[Main] Server ready at',
    `http${config.ssl ? 's' : ''}://${config.hostname}:${config.port}${apollo.graphqlPath}`
  )
  console.log(`[Main] Subscriptions ready at ws${config.ssl ? 's' : ''}://${config.hostname}:${config.port}${apollo.subscriptionsPath}`)
})
import Koa from 'koa'
import Router from 'koa-router'
import {
  ApolloServer,
  gql,
  PlaygroundConfig,
  IResolverObject,
  defaultPlaygroundOptions,
  Config,
  ServerRegistration
} from 'apollo-server-koa'
import { GraphQLJSON } from 'graphql-type-json'

import cors from '@koa/cors'
import logger from 'koa-logger'
import json from 'koa-json'
import bodyParser from 'koa-bodyparser'

const app = new Koa()
const router = new Router()

// Routes
router.get('/', async (ctx, next) => {
  ctx.body = {
    msg: 'Hello world!'
  }

  await next()
})

// Middleware
app.use(json())
app.use(logger())
app.use(bodyParser())

// Router
app.use(router.routes()).use(router.allowedMethods())

app.listen(4000, () => {
  console.log('🚀 koa server started!')
})
import Koa from 'koa'
import Router from 'koa-router'
import {
  ApolloServer,
  gql,
  PlaygroundConfig,
  IResolverObject,
  defaultPlaygroundOptions,
  Config,
  ServerRegistration,
} from 'apollo-server-koa'
import { DocumentNode } from 'graphql'
import { GraphQLJSON } from 'graphql-type-json'
import { Server } from 'http'

import cors from '@koa/cors'
import logger from 'koa-logger'
import json from 'koa-json'
import bodyParser from 'koa-bodyparser'

export interface GraphQLResponse {
  code: number
  success: boolean
  message: string
}

interface User {

}

interface Session {

}

type SubScriptOnConnect = () => {
  current: User,
  session: Session
}

type SubScriptDisConnect = () => {

}

export interface SubScriptionConfig {
  path?: string
  onConnect: () => any,
  onDisconnect: () => any
}

type GraphQLResolver = () => GraphQLResponse

export interface GraphQLService {
  typeDefs: DocumentNode[]
  resolvers: GraphQLResolver[]
}

export type GraphQLServerEnchancer = (
  app: Koa,
  server: Server,
  services: GraphQLService
) => void

export interface GraphQLServerOptions extends Config {
  port?: number
  basename?: string | string[]
  path?: string | string[]
  enhancers?: GraphQLServerEnchancer
  services?: GraphQLService
  subscriptions?: SubScriptionConfig,
  cacheControl: 
}
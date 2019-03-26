import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import typeDefs from './graphql/schema'
import resolvers from './graphql/resolvers'
import fs from 'fs'
import https from 'https'
import http from 'http'

import session from './session'

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
  }
})

const app = express()
apollo.applyMiddleware({ app })

// Create the HTTPS or HTTP server, per configuration
var server
if (config.ssl) {
  // Assumes certificates are in .ssl folder from package root. Make sure the files
  // are secured.
  server = https.createServer(
    {
      key: fs.readFileSync(`./ssl/${environment}/server.key`),
      cert: fs.readFileSync(`./ssl/${environment}/server.crt`)
    },
    app
  )
} else {
  server = http.createServer(app)
}

// Add subscription support
apollo.installSubscriptionHandlers(server)

server.listen({ port: config.port }, () =>
  console.log(
    '[Main] Server ready at',
    `http${config.ssl ? 's' : ''}://${config.hostname}:${config.port}${apollo.graphqlPath}`
  )
)
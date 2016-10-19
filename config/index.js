'use strict'

const Path = require('path')

/*
* HAPI
*/

const hapiServer = {
  connections: {
    router: {
      isCaseSensitive: false,
      stripTrailingSlash: true
    },
    routes: {
      files: {
        relativeTo: Path.resolve(__dirname, 'api', 'v1')
      }
    }
  }
}

const hapiConnection = {
  host: 'localhost',
  port: 8080
}

/*
* MONGODB
*/

// What is native_parser?
const mongoOptions = {
  db: {
    native_parser: true
  },
  server: {
    poolSize: 5
  }
}

const mongoConnection = {
  host: 'localhost',
  port: '27017',
  db: 'tw-api'
}

const mongoUrl = `mongodb://${mongoConnection.host}:${mongoConnection.port}/${mongoConnection.db}`

const mongoCollection = {
  signup: 'users',
  login: 'users',
  listAllUsers: 'users',
  listUser: 'users',
  updateUser: 'users',
  deleteUser: 'users',
  parseCredentials: 'users',
  parseToken: 'users'
}

/*
* API
*/

const apiKey = 'secretkey'

module.exports = {
  hapiServer,
  hapiConnection,
  mongoOptions,
  mongoUrl,
  mongoCollection,
  apiKey
}

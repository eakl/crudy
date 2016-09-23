'use strict'

const Path = require('path')

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

// What is native_parser?
const mongoConfig = {
  db: {
    native_parser: true
  },
  server: {
    poolSize: 5
  }
}

module.exports = {
  hapiServer,
  hapiConnection,
  mongoConfig
}

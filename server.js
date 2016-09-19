'use strict'

const Hapi = require('hapi')
const Path = require('path')

const _routes = require('./routes')

const server = new Hapi.Server({
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
})
server.connection({
  host: 'localhost',
  port: 8080
})

server.route(_routes)

server.start((err) => {
  if (err) {
    throw err
  }

  console.log(`Server running at: ${server.info.uri}`)
})

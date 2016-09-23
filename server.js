'use strict'

const Hapi = require('hapi')

const Db = require('./lib/db')
const _routes = require('./routes')
const _config = require('./config')

const server = new Hapi.Server(_config.hapiServer)

server.connection(_config.hapiConnection)
server.route(_routes)

Db.connect('mongodb://localhost:27017/tw-api')
.then(() => {
  server.start((err) => {
    if (err) {
      throw err
    }
    console.log(`Server running at: ${server.info.uri}`)
  })
})
.catch((e) => {
  console.log('Server not launched:',e)
})

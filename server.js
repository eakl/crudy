'use strict'

const Hapi = require('hapi')

const Db = require('./lib/db')
const Config = require('./config')
const routes = require('./routes')

const server = new Hapi.Server(Config.hapiServer)
server.connection(Config.hapiConnection)
server.route(routes)

if (require.main === module) {
  Db.connect()
  server.start((err) => {
    if (err) {
      throw err
    }
    console.log(`Server running at: ${server.info.uri}`)
  })
}

module.exports = server

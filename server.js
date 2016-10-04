'use strict'

const Hapi = require('hapi')

const Db = require('./lib/db')
const Config = require('./config')

Db.connect(Config.mongoUrl)
.then(() => {
  const routes = require('./routes')

  const server = new Hapi.Server(Config.hapiServer)
  server.connection(Config.hapiConnection)
  server.route(routes)

  server.start((err) => {
    if (err) {
      throw err
    }
    console.log(`Server running at: ${server.info.uri}`)
  })
})
.catch((e) => {
  console.error(`${e.name}: ${e.message}`)
  return
})

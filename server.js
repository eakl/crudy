'use strict'

const Hapi = require('hapi')

const Db = require('./lib/db')
const config = require('./config')

Db.connect(config.mongoUrl)
.then(() => {
  const routes = require('./routes')

  const server = new Hapi.Server(config.hapiServer)
  server.connection(config.hapiConnection)
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

'use strict'

const Db = require('../lib/db')

function* init (t) {
  const db = yield Db.connect()
  const cols = yield db.listCollections({}).toArray()

  let cleaned = 0
  for (const col of cols) {
    yield db.collection(col.name).deleteMany({})
    ++cleaned
  }
  t.pass(`Cleaned up ${cleaned} collections`)

  return db
}

function getToken (server, creds) {
  const opts = {
    method: 'GET',
    url: '/login',
    headers: {
      Authorization: 'Basic ' + Buffer.from(creds).toString('base64')
    }
  }
  return server
  .inject(opts)
  .then((res) => res.result.token)
}

module.exports = {
  init,
  getToken
}

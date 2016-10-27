'use strict'

const test = require('tape')
const Db = require('../lib/db')

test.onFinish(() => {
  Db
  .connect()
  .then(db => db.dropDatabase())
  .then(() => Db.close())
  .then(() => console.log('Done.'))
})

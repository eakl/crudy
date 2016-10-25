'use strict'

const P = require('bluebird')
const test = require('tape')

const Db = require('../lib/db')
const Config = require('../config')
const Col = require('../config').mongoCollection

test('Clear DB', (t) => {
  return (P.coroutine(function* () {
    const db = yield Db.connect(Config.mongoUrl)
    const dbCol = db.collection(Col.tests)

    yield dbCol.deleteMany({ $or: [{ username: 'ace' }, { username: 'base' }] })

    const res = yield dbCol.find({ $or: [{ username: 'ace' }, { username: 'base' }] }).toArray()
    console.log(res)

    t.equal(res.length, 0, 'DB has been cleared')

    t.end()
    Db.close()

  }))()
})

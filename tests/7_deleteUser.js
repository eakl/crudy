'use strict'

const P = require('bluebird')
const test = require('tape')

const server = require('../server')
const Db = require('../lib/db')
const Config = require('../config')
const Col = require('../config').mongoCollection
const { getToken } = require('./getToken')

test('Delete User', (t) => {
  return (P.coroutine(function* () {
    const db = yield Db.connect(Config.mongoUrl)
    const dbCol = db.collection(Col.signup)
    const token = yield getToken(server, 'base:base_password')

    const noRight = {
      method: 'DELETE',
      url: '/user/ace',
      headers: {
        Authorization: token
      }
    }

    const noRightResult = yield server.inject(noRight)
    t.equal(noRightResult.statusCode, 403, 'status code: 403')
    t.equal(noRightResult.statusMessage, 'Forbidden', 'status message: "Forbidden"')
    t.equal(noRightResult.result.message, 'You don\'t have the privileges for this operation', 'you don\'t have the privileges for this operation')

    const noRightResponse = yield dbCol.findOne({ username: 'ace' })
    t.notEqual(noRightResponse, null, '"ace" has not been deleted')

    /****************************/

    const correct = {
      method: 'DELETE',
      url: '/user/base',
      headers: {
        Authorization: token
      }
    }

    const correctResult = yield server.inject(correct)
    t.equal(correctResult.statusCode, 200, 'status code: 200')
    t.equal(correctResult.statusMessage, 'OK', 'status message: "OK"')
    t.equal(correctResult.result.message, 'User deleted', 'user deleted')

    const correctResponse = yield dbCol.findOne({ username: 'base' })
    t.equal(correctResponse, null, '"base" has been deleted')

    t.end()
    Db.close()

  }))()
})

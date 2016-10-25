'use strict'

const P = require('bluebird')
const test = require('tape')

const server = require('../server')
const Db = require('../lib/db')
const Config = require('../config')
const { getToken } = require('./getToken')

test('List One User', (t) => {
  return (P.coroutine(function* () {
    yield Db.connect(Config.mongoUrl)
    const token = yield getToken(server, 'ace:ace_password')

    const base = {
      method: 'GET',
      url: '/user/base',
      headers: {
        Authorization: token
      }
    }

    const correctResult = yield server.inject(base)
    t.equal(correctResult.statusCode, 200, 'status code: 200')
    t.equal(correctResult.statusMessage, 'OK', 'status message: "OK"')
    t.ok(correctResult.result.hasOwnProperty('user'), 'user returned')
    t.ok(correctResult.result.user.password.match(/\**/), 'user returned')

    t.end()
    Db.close()

  }))()
})

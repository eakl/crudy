'use strict'

const P = require('bluebird')
const test = require('tape')

const server = require('../server')
const Db = require('../lib/db')
const Config = require('../config')
const { getToken } = require('./getToken')

test('List All Users', (t) => {
  return (P.coroutine(function* () {
    yield Db.connect(Config.mongoUrl)
    let token = yield getToken(server, 'base:ace_password')

    const wrongCreds = {
      method: 'GET',
      url: '/user',
      headers: {
        Authorization: token
      }
    }

    const wrongCredsResult = yield server.inject(wrongCreds)
    t.equal(wrongCredsResult.statusCode, 401, 'status code: 401')
    t.equal(wrongCredsResult.statusMessage, 'Unauthorized', 'status message: "Unauthorized"')
    t.notOk(wrongCredsResult.result.hasOwnProperty('users'), 'user list not returned')

    /****************************/

    token = yield getToken(server, 'ace:ace_password')

    const correct = {
      method: 'GET',
      url: '/user',
      headers: {
        Authorization: token
      }
    }

    const correctResult = yield server.inject(correct)
    t.equal(correctResult.statusCode, 200, 'status code: 200')
    t.equal(correctResult.statusMessage, 'OK', 'status message: "OK"')
    t.ok(correctResult.result.hasOwnProperty('users'), 'user list returned')
    t.equal(correctResult.result.users.length, 2, 'user list contains 2 users')
    t.equal(correctResult.result.users[1], 'base', 'second user is "base"')

    t.end()
    Db.close()

  }))()
})

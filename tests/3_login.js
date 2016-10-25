'use strict'

const P = require('bluebird')
const test = require('tape')

const server = require('../server')
const Db = require('../lib/db')
const Config = require('../config')

test('Login', (t) => {
  return (P.coroutine(function* () {
    yield Db.connect(Config.mongoUrl)

    const wrongUsername = {
      method: 'GET',
      url: '/login',
      headers: {
        Authorization: 'Basic ' + Buffer.from('base:ace_password').toString('base64')
      }
    }

    const wrongUsernameResult = yield server.inject(wrongUsername)
    t.notEqual(wrongUsernameResult.request.headers.authorization, 'Basic YWNlOmFjZV9wYXNzd29yZA==', 'wrong credentials')
    t.equal(wrongUsernameResult.statusCode, 401, 'status code: 401')
    t.equal(wrongUsernameResult.statusMessage, 'Unauthorized', 'status message: "Unauthorized"')
    t.notOk(wrongUsernameResult.result.hasOwnProperty('token'), 'token not created')

    /****************************/

    const wrongPassword = {
      method: 'GET',
      url: '/login',
      headers: {
        Authorization: 'Basic ' + Buffer.from('ace:base_password').toString('base64')
      }
    }

    const wrongPasswordResult = yield server.inject(wrongPassword)
    t.notEqual(wrongUsernameResult.request.headers.authorization, 'Basic YWNlOmFjZV9wYXNzd29yZA==', 'wrong credentials')
    t.equal(wrongPasswordResult.statusCode, 401, 'status code: 401')
    t.equal(wrongPasswordResult.statusMessage, 'Unauthorized', 'status message: "Unauthorized"')
    t.notOk(wrongPasswordResult.result.hasOwnProperty('token'), 'token not created')

    /****************************/

    const ace = {
      method: 'GET',
      url: '/login',
      headers: {
        Authorization: 'Basic ' + Buffer.from('ace:ace_password').toString('base64')
      }
    }

    const aceResult = yield server.inject(ace)
    t.equal(aceResult.request.headers.authorization, 'Basic YWNlOmFjZV9wYXNzd29yZA==', 'correct credentials')
    t.equal(aceResult.statusCode, 201, 'status code: 201')
    t.equal(aceResult.statusMessage, 'Created', 'status message: "Created"')
    t.equal(aceResult.result.message, 'Login successful', 'login successful')
    t.ok(aceResult.result.hasOwnProperty('token'), 'token created')

    t.end()
    Db.close()

  }))()
})

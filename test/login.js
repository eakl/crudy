'use strict'

const P = require('bluebird')
const test = require('tape')
const Uuid = require('uuid')

const server = require('../server')
const Col = require('../config').mongoCollection
const Util = require('../lib/util')
const { init } = require('./helpers')

const co = f => P.coroutine(f)

test('login with an unexisting user', co(userDoesntExist))
test('login with a wrong password', co(wrongPassword))
test('login successfully and return a token', co(getToken))

function* userDoesntExist (t) {
  const db = yield* init(t)
  const dbCol = db.collection(Col.login)

  yield dbCol.insert({
    _id: Uuid.v1(),
    username: 'ace',
    password: yield Util.hash('ace_password'),
    isAdmin: false
  })

  const opts = {
    method: 'GET',
    url: '/login',
    headers: {
      Authorization: 'Basic ' + Buffer.from('chase:chase_password').toString('base64')
    }
  }
  const response = yield server.inject(opts)

  t.notEqual(response.request.headers.authorization, 'Basic YWNlOmFjZV9wYXNzd29yZA==', 'Wrong credentials')
  t.equal(response.statusCode, 401, 'Status code \'401\' returned')
  t.equal(response.statusMessage, 'Unauthorized', 'Status message \'Unauthorized\' returned')
  t.notOk(response.result.hasOwnProperty('token'), 'No token returned')

  t.end()
}

function* wrongPassword (t) {
  const db = yield* init(t)
  const dbCol = db.collection(Col.login)

  yield dbCol.insert({
    _id: Uuid.v1(),
    username: 'ace',
    password: yield Util.hash('ace_password'),
    isAdmin: false
  })

  const opts = {
    method: 'GET',
    url: '/login',
    headers: {
      Authorization: 'Basic ' + Buffer.from('ace:base_password').toString('base64')
    }
  }
  const response = yield server.inject(opts)

  t.notEqual(response.request.headers.authorization, 'Basic YWNlOmFjZV9wYXNzd29yZA==', 'Wrong credentials')
  t.equal(response.statusCode, 401, 'Status code \'401\' returned')
  t.equal(response.statusMessage, 'Unauthorized', 'Status message \'Unauthorized\' returned')
  t.notOk(response.result.hasOwnProperty('token'), 'No token returned')

  t.end()
}

function* getToken (t) {
  const db = yield* init(t)
  const dbCol = db.collection(Col.login)

  yield dbCol.insert({
    _id: Uuid.v1(),
    username: 'ace',
    password: yield Util.hash('ace_password'),
    isAdmin: false
  })

  const opts = {
    method: 'GET',
    url: '/login',
    headers: {
      Authorization: 'Basic ' + Buffer.from('ace:ace_password').toString('base64')
    }
  }
  const response = yield server.inject(opts)

  t.equal(response.request.headers.authorization, 'Basic YWNlOmFjZV9wYXNzd29yZA==', 'Credentials are correct')
  t.equal(response.statusCode, 201, 'Status code \'201\' returned')
  t.equal(response.statusMessage, 'Created', 'Status message \'Created\' returned')
  t.equal(response.result.message, 'Login successful', 'Response message is correct')
  t.ok(response.result.hasOwnProperty('token'), 'Token returned')

  t.end()
}

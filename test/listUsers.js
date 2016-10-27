'use strict'

const P = require('bluebird')
const test = require('tape')
const Uuid = require('uuid')

const server = require('../server')
const Col = require('../config').mongoCollection
const Util = require('../lib/util')
const { init, getToken } = require('./helpers')

const co = f => P.coroutine(f)

test('list users given a wrong access token', co(wrongToken))
test('list users given a valid access token', co(getUsers))
test('list a single user given a valid access token', co(getUser))

function* wrongToken (t) {
  const db = yield* init(t)
  const dbCol = db.collection(Col.listAllUsers)

  yield dbCol.insert({
    _id: Uuid.v1(),
    username: 'ace',
    password: yield Util.hash('ace_password'),
    isAdmin: false
  })

  const token = yield getToken(server, 'ace:base_password')
  const opts = {
    method: 'GET',
    url: '/user',
    headers: {
      Authorization: token
    }
  }
  const result = yield server.inject(opts)

  t.equal(result.statusCode, 401, 'Status code \'401\' returned')
  t.equal(result.statusMessage, 'Unauthorized', 'Status message \'Unauthorized\' returned')
  t.notOk(result.result.hasOwnProperty('users'), 'User list not returned')

  t.end()
}

function* getUsers (t) {
  const db = yield* init(t)
  const dbCol = db.collection(Col.listAllUsers)

  yield dbCol.insert({
    _id: Uuid.v1(),
    username: 'ace',
    password: yield Util.hash('ace_password'),
    isAdmin: false
  })
  const users = yield dbCol.find({}).toArray()
  const userList = users.map(x => x.username)

  const token = yield getToken(server, 'ace:ace_password')
  const opts = {
    method: 'GET',
    url: '/user',
    headers: {
      Authorization: token
    }
  }
  const response = yield server.inject(opts)

  t.equal(response.statusCode, 200, 'Status code \'200\' returned')
  t.equal(response.statusMessage, 'OK', 'Status message \'OK\' returned')
  t.equal(response.result.users.length, users.length, `User list contains ${users.length} users`)
  t.deepEqual(response.result.users, userList, 'User list returned is matching the user base')

  t.end()
}

function* getUser (t) {
  const db = yield* init(t)
  const dbCol = db.collection(Col.listUser)

  yield dbCol.insert({
    _id: Uuid.v1(),
    username: 'ace',
    password: yield Util.hash('ace_password'),
    isAdmin: false
  })
  const user = yield dbCol.findOne({ username: 'ace' })
  user.password = '************'

  const token = yield getToken(server, 'ace:ace_password')
  const opts = {
    method: 'GET',
    url: '/user/ace',
    headers: {
      Authorization: token
    }
  }
  const response = yield server.inject(opts)

  t.equal(response.statusCode, 200, 'Status code \'200\' returned')
  t.equal(response.statusMessage, 'OK', 'Status message \'OK\' returned')
  t.ok(response.result.hasOwnProperty('user') && typeof(response.result.user) === 'object', 'User object returned')
  t.deepEqual(response.result.user, user, 'User object returned is matching the user in the database')
  t.ok(response.result.user.password.match(/\**/), 'User password is masked')

  t.end()
}

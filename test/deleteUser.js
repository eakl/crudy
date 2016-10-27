'use strict'

const P = require('bluebird')
const test = require('tape')
const Uuid = require('uuid')

const server = require('../server')
const Col = require('../config').mongoCollection
const Util = require('../lib/util')
const { init, getToken } = require('./helpers')

const co = f => P.coroutine(f)

test('delete another user than himself', co(deleteWithoutPrivilege))
test('delete a user successfully', co(deleteUser))

function* deleteWithoutPrivilege (t) {
  const db = yield* init(t)
  const dbCol = db.collection(Col.deleteUser)

  yield dbCol.insert({
    _id: Uuid.v1(),
    username: 'ace',
    password: yield Util.hash('ace_password'),
    isAdmin: false
  })
  yield dbCol.insert({
    _id: Uuid.v1(),
    username: 'base',
    password: yield Util.hash('base_password'),
    isAdmin: false
  })

  // We try to delete 'base' with 'ace' access token
  const aceToken = yield getToken(server, 'ace:ace_password')
  const opts = {
    method: 'DELETE',
    url: '/user/base',
    headers: {
      Authorization: aceToken
    }
  }
  const response = yield server.inject(opts)
  const user = yield dbCol.findOne({ username: 'base' })

  t.equal(response.statusCode, 403, 'Status code \'403\' returned')
  t.equal(response.statusMessage, 'Forbidden', 'Status message \'Forbidden\' returned')
  t.equal(response.result.message, 'You don\'t have the privileges for this operation', 'Response message is correct')
  t.ok(user, 'Base has not beeen deleted')

  t.end()
}

function* deleteUser (t) {
  const db = yield* init(t)
  const dbCol = db.collection(Col.deleteUser)

  yield dbCol.insert({
    _id: Uuid.v1(),
    username: 'ace',
    password: yield Util.hash('ace_password'),
    isAdmin: false
  })

  const token = yield getToken(server, 'ace:ace_password')
  const opts = {
    method: 'DELETE',
    url: '/user/ace',
    headers: {
      Authorization: token
    }
  }
  const response = yield server.inject(opts)
  const user = yield dbCol.findOne({ username: 'ace' })

  t.equal(response.statusCode, 200, 'Status code \'200\' returned')
  t.equal(response.statusMessage, 'OK', 'Status message \'OK\' returned')
  t.equal(response.result.message, 'User deleted', 'Response message is correct')
  t.equal(user, null, 'User Ace has been deleted')

  t.end()
}

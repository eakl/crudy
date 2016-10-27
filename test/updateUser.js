'use strict'

const P = require('bluebird')
const test = require('tape')
const Uuid = require('uuid')

const server = require('../server')
const Col = require('../config').mongoCollection
const Util = require('../lib/util')
const { init, getToken } = require('./helpers')

const co = f => P.coroutine(f)

test('update a user with an empty field', co(updateWithEmptyField))
test('update another user than himself', co(updateWithoutPrivilege))
test('update a user without changing any property', co(updateWithoutChanges))
test('update a user\'s admin right without privilege', co(updateAdminRights))
test('update a user successfully', co(updateUser))
test('try to access ressources after the access token has been revoked', co(revokedToken))

function* updateWithEmptyField (t) {
  const db = yield* init(t)
  const dbCol = db.collection(Col.updateUser)

  yield dbCol.insert({
    _id: Uuid.v1(),
    username: 'ace',
    password: yield Util.hash('ace_password'),
    isAdmin: false
  })
  const userBefore = yield dbCol.findOne({ username: 'ace' })

  const token = yield getToken(server, 'ace:ace_password')
  const opts = {
    method: 'PATCH',
    url: '/user/ace',
    headers: {
      Authorization: token
    },
    payload: { password: '' }
  }
  const response = yield server.inject(opts)
  const userAfter = yield dbCol.findOne({ username: 'ace' })

  t.equal(response.statusCode, 400, 'Status code \'400\' returned')
  t.equal(response.statusMessage, 'Bad Request', 'Status message \'Bad Request\' returned')
  t.equal(response.result.message, 'Invalid request payload JSON format: "password" is not allowed to be empty', 'Response message is correct')
  t.deepEqual(userAfter, userBefore, 'User\'s password has not been updated')

  t.end()
}

function* updateWithoutPrivilege (t) {
  const db = yield* init(t)
  const dbCol = db.collection(Col.updateUser)

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
  const baseBefore = yield dbCol.findOne({ username: 'base' })

  // We try to update 'base' with 'ace' access token
  const aceToken = yield getToken(server, 'ace:ace_password')
  const opts = {
    method: 'PATCH',
    url: '/user/base',
    headers: {
      Authorization: aceToken
    },
    payload: { password: 'another_password' }
  }
  const response = yield server.inject(opts)
  const baseAfter = yield dbCol.findOne({ username: 'base' })

  t.equal(response.statusCode, 403, 'Status code \'403\' returned')
  t.equal(response.statusMessage, 'Forbidden', 'Status message \'Forbidden\' returned')
  t.equal(response.result.message, 'You don\'t have the privileges for this operation', 'Response message is correct')
  t.deepEqual(baseAfter, baseBefore, 'Base\'s password has not been updated')

  t.end()
}

function* updateWithoutChanges (t) {
  const db = yield* init(t)
  const dbCol = db.collection(Col.updateUser)

  yield dbCol.insert({
    _id: Uuid.v1(),
    username: 'ace',
    password: yield Util.hash('ace_password'),
    isAdmin: false
  })
  const userBefore = yield dbCol.findOne({ username: 'ace' })

  const token = yield getToken(server, 'ace:ace_password')
  const opts = {
    method: 'PATCH',
    url: '/user/ace',
    headers: {
      Authorization: token
    },
    payload: { password: 'ace_password' }
  }
  const response = yield server.inject(opts)
  const userAfter = yield dbCol.findOne({ username: 'ace' })

  t.equal(response.statusCode, 422, 'Status code \'422\' returned')
  t.equal(response.statusMessage, 'Unprocessable Entity', 'Status message \'Unprocessable Entity\' returned')
  t.equal(response.result.message, 'Unprocessable Entity: Nothing to update', 'Response message is correct')
  t.deepEqual(userAfter, userBefore, 'User has not been updated')

  t.end()
}

function* updateAdminRights (t) {
  const db = yield* init(t)
  const dbCol = db.collection(Col.updateUser)

  yield dbCol.insert({
    _id: Uuid.v1(),
    username: 'ace',
    password: yield Util.hash('ace_password'),
    isAdmin: false
  })
  const userBefore = yield dbCol.findOne({ username: 'ace' })

  const token = yield getToken(server, 'ace:ace_password')
  const opts = {
    method: 'PATCH',
    url: '/user/ace',
    headers: {
      Authorization: token
    },
    payload: { isAdmin: true }
  }
  const response = yield server.inject(opts)
  const userAfter = yield dbCol.findOne({ username: 'ace' })

  t.equal(response.statusCode, 403, 'Status code \'403\' returned')
  t.equal(response.statusMessage, 'Forbidden', 'Status message \'Forbidden\' returned')
  t.equal(response.result.message, 'You want to be admin? :D', 'Admin escalation right is forbidden')
  t.deepEqual(userAfter, userBefore, 'User is not admin')

  t.end()
}

function* updateUser (t) {
  const db = yield* init(t)
  const dbCol = db.collection(Col.updateUser)

  yield dbCol.insert({
    _id: Uuid.v1(),
    username: 'ace',
    password: yield Util.hash('ace_password'),
    isAdmin: false
  })

  const token = yield getToken(server, 'ace:ace_password')
  const opts = {
    method: 'PATCH',
    url: '/user/ace',
    headers: {
      Authorization: token
    },
    payload: { password: 'other_password' }
  }
  const response = yield server.inject(opts)
  const userAfter = yield dbCol.findOne({ username: 'ace' })

  t.equal(response.statusCode, 200, 'Status code \'200\' returned')
  t.equal(response.statusMessage, 'OK', 'Status message \'OK\' returned')
  t.equal(response.result.message, 'User updated', 'Response message is correct')
  t.ok(userAfter.hasOwnProperty('lastModified'), 'User has been updated')
  t.deepEqual(Object.keys(response.result.delta), Object.keys(opts.payload), 'Every update has been taken into account')

  t.end()
}

function* revokedToken (t) {
  const db = yield* init(t)
  const dbCol = db.collection(Col.updateUser)

  yield dbCol.insert({
    _id: Uuid.v1(),
    username: 'ace',
    password: yield Util.hash('ace_password'),
    isAdmin: false
  })

  const token = yield getToken(server, 'ace:ace_password')
  const opts1 = {
    method: 'PATCH',
    url: '/user/ace',
    headers: {
      Authorization: token
    },
    payload: { password: 'other_password' }
  }
  yield server.inject(opts1)
  const userAfter = yield dbCol.findOne({ username: 'ace' })

  const opts2 = {
    method: 'GET',
    url: '/user/ace',
    headers: {
      Authorization: token
    }
  }
  const response = yield server.inject(opts2)

  t.ok(userAfter.hasOwnProperty('lastModified'), 'User has been updated')
  t.equal(response.statusCode, 401, 'Status code \'401\' returned')
  t.equal(response.statusMessage, 'Unauthorized', 'Status message \'Unauthorized\' returned')
  t.notOk(response.result.hasOwnProperty('user') && typeof(response.result.user) === 'object', 'User object not returned')

  t.end()
}

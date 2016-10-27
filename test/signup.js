'use strict'

const P = require('bluebird')
const test = require('tape')
const Uuid = require('uuid')

const server = require('../server')
const Col = require('../config').mongoCollection
const Util = require('../lib/util')
const { init } = require('./helpers')

const co = f => P.coroutine(f)

test('signup without password', co(noPassword))
test('signup with an empty password', co(emptyPassword))
test('signup users Ace and Base', co(addUsers))
test('signup Ace given that the user already exists', co(alreadyExists))

function* noPassword (t) {
  const db = yield* init(t)
  const dbCol = db.collection(Col.signup)

  const opts = {
    method: 'POST',
    url: '/signup',
    payload: { username: 'ace' }
  }
  const response = yield server.inject(opts)
  const user = yield dbCol.findOne({ username: opts.payload.username })

  t.equal(response.statusCode, 400, 'Status code \'400\' returned')
  t.equal(response.statusMessage, 'Bad Request', 'Status message \'Bad Request\' returned')
  t.equal(response.result.message, 'Invalid request payload JSON format: "password" is required', 'Response message is correct')
  t.equal(user, null, 'User \'ace\' has not been added')

  t.end()
}

function* emptyPassword (t) {
  const db = yield* init(t)
  const dbCol = db.collection(Col.signup)

  const opts = {
    method: 'POST',
    url: '/signup',
    payload: { username: 'ace', password: '' }
  }
  const result = yield server.inject(opts)
  const user = yield dbCol.findOne({ username: opts.payload.username })

  t.equal(result.statusCode, 400, 'Status code \'400\' returned')
  t.equal(result.statusMessage, 'Bad Request', 'Status message \'Bad Request\' returned')
  t.equal(result.result.message, 'Invalid request payload JSON format: "password" is not allowed to be empty', 'Response message is correct')
  t.equal(user, null, 'User \'ace\' has not been added')

  t.end()
}

function* addUsers (t) {
  const db = yield* init(t)
  const dbCol = db.collection(Col.signup)

  const opts1 = {
    method: 'POST',
    url: '/signup',
    payload: { username: 'ace', password: 'ace_password' }
  }
  const opts2 = {
    method: 'POST',
    url: '/signup',
    payload: { username: 'base', password: 'base_password' }
  }
  const response1 = yield server.inject(opts1)
  const response2 = yield server.inject(opts2)
  const users = yield dbCol.find({}).toArray()
  const userList = users.map(x => x.username)

  t.ok((response1.statusCode === 201) && (response2.statusCode === 201), 'Status code \'201\' returned')
  t.ok((response1.statusMessage === 'Created') && (response2.statusMessage === 'Created'), 'Status message \'Created\' returned')
  t.ok((response1.result.message === 'User added to the user base') && (response2.result.message === 'User added to the user base'), 'Response message is correct')
  t.equal(users.length, 2, 'Two users have been added')
  t.deepEqual(userList, ['ace', 'base'], 'Users \'ace\' and \'base\' are in the database')

  t.end()
}

function* alreadyExists (t) {
  const db = yield* init(t)
  const dbCol = db.collection(Col.signup)

  yield dbCol.insert({
    _id: Uuid.v1(),
    username: 'ace',
    password: yield Util.hash('ace_password'),
    isAdmin: false
  })
  const userBefore = yield dbCol.find({}).toArray()

  const opts = {
    method: 'POST',
    url: '/signup',
    payload: { username: 'ace', password: 'ace_password' }
  }
  const response = yield server.inject(opts)
  const userAfter = yield dbCol.find({}).toArray()

  t.equal(response.statusCode, 409, 'Status code \'409\' returned')
  t.equal(response.statusMessage, 'Conflict', 'Status message \'Conflict\' returned')
  t.equal(response.result.message, 'The user already exists', 'Response message is correct')
  t.equal(userAfter.length, 1, 'User has not been added')
  t.equal(userAfter._id, userBefore._id, 'User \'ace\' is still the same')

  t.end()
}

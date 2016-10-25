'use strict'

const P = require('bluebird')
const test = require('tape')

const server = require('../server')
const Db = require('../lib/db')
const Config = require('../config')
const Col = require('../config').mongoCollection

test('Signup', (t) => {
  return (P.coroutine(function* () {
    const db = yield Db.connect(Config.mongoUrl)
    const dbCol = db.collection(Col.signup)

    const missingKey = {
      method: 'POST',
      url: '/signup',
      payload: { username: 'ace' }
    }

    const missingKeyResult = yield server.inject(missingKey)
    t.equal(missingKeyResult.statusCode, 400, 'status code: 400')
    t.equal(missingKeyResult.statusMessage, 'Bad Request', 'status message: "Bad Request"')
    t.equal(missingKeyResult.result.message, 'Invalid request payload JSON format: "password" is required', 'message: "password" is required')

    const missingKeyResponse = yield dbCol.findOne({ username: missingKey.payload.username })
    t.equal(missingKeyResponse, null, '"ace" has not been added')

    /****************************/

    const emptyKey = {
      method: 'POST',
      url: '/signup',
      payload: { username: 'ace', password: '' }
    }

    const emptyKeyResult = yield server.inject(emptyKey)
    t.equal(emptyKeyResult.statusCode, 400, 'status code: 400')
    t.equal(emptyKeyResult.statusMessage, 'Bad Request', 'status message: "Bad Request"')
    t.equal(emptyKeyResult.result.message, 'Invalid request payload JSON format: "password" is not allowed to be empty', 'message: "password" is not allowed to be empty')

    const emptyKeyResponse = yield dbCol.findOne({ username: emptyKey.payload.username })
    t.equal(emptyKeyResponse, null, '"ace" has not been added')

    /****************************/

    const ace = {
      method: 'POST',
      url: '/signup',
      payload: { username: 'ace', password: 'ace_password' }
    }

    const base = {
      method: 'POST',
      url: '/signup',
      payload: { username: 'base', password: 'base_password' }
    }

    const aceResult = yield server.inject(ace)
    yield server.inject(base)
    t.equal(aceResult.statusCode, 201, 'status code: 201')
    t.equal(aceResult.statusMessage, 'Created', 'status message: "Created"')
    t.equal(aceResult.result.message, 'User added to the user base', 'message: "User added to the user base"')

    const userResponse = yield dbCol.find({}).toArray()
    t.equal(userResponse.length, 2, 'two users found in the DB')
    t.equal(userResponse[1].username, 'base', '"base" user found in the DB')

    /****************************/

    const already = {
      method: 'POST',
      url: '/signup',
      payload: { username: 'base', password: 'base_password' }
    }

    const alreadyResult = yield server.inject(already)
    t.equal(alreadyResult.statusCode, 409, 'status code: 409')
    t.equal(alreadyResult.statusMessage, 'Conflict', 'status message: "Conflict"')
    t.equal(alreadyResult.result.message, 'The user already exists', 'message: "The user already exists"')

    const alreadyResponse = yield dbCol.find({}).toArray()
    t.equal(alreadyResponse.length, 2, '"bar" not added, still two user found in the DB')

    t.end()
    Db.close()

  }))()
})

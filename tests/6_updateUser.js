'use strict'

const P = require('bluebird')
const test = require('tape')

const server = require('../server')
const Db = require('../lib/db')
const Config = require('../config')
const Col = require('../config').mongoCollection
const { getToken } = require('./getToken')

test('Update User', (t) => {
  return (P.coroutine(function* () {
    const db = yield Db.connect(Config.mongoUrl)
    const dbCol = db.collection(Col.signup)
    const token = yield getToken(server, 'ace:ace_password')
    const ace = yield dbCol.findOne({ username: 'ace' })
    const base = yield dbCol.findOne({ username: 'base' })

    const emptyValue = {
      method: 'PATCH',
      url: '/user/ace',
      headers: {
        Authorization: token
      },
      payload: { password: '' }
    }

    const emptyValueResult = yield server.inject(emptyValue)
    t.equal(emptyValueResult.statusCode, 400, 'status code: 400')
    t.equal(emptyValueResult.statusMessage, 'Bad Request', 'status message: "Bad Request"')
    t.equal(emptyValueResult.result.message, 'Invalid request payload JSON format: "password" is not allowed to be empty', '"password" is not allowed to be empty')

    const emptyValueResponse = yield dbCol.findOne({ username: 'ace' })
    t.equal(emptyValueResponse.password, ace.password, '"ace" has not been updated')

    /****************************/

    const noRight = {
      method: 'PATCH',
      url: '/user/base',
      headers: {
        Authorization: token
      },
      payload: { password: 'another_password' }
    }

    const noRightResult = yield server.inject(noRight)
    t.equal(noRightResult.statusCode, 403, 'status code: 403')
    t.equal(noRightResult.statusMessage, 'Forbidden', 'status message: "Forbidden"')
    t.equal(noRightResult.result.message, 'You don\'t have the privileges for this operation', 'you don\'t have the privileges for this operation')

    const noRightResponse = yield dbCol.findOne({ username: 'base' })
    t.equal(noRightResponse.password, base.password, '"base" has not been updated')

    /****************************/

    const noChange = {
      method: 'PATCH',
      url: '/user/ace',
      headers: {
        Authorization: token
      },
      payload: { password: 'ace_password' }
    }

    const noChangeResult = yield server.inject(noChange)
    t.equal(noChangeResult.statusCode, 422, 'status code: 422')
    t.equal(noChangeResult.statusMessage, 'Unprocessable Entity', 'status message: "Unprocessable Entity"')
    t.equal(noChangeResult.result.message, 'Unprocessable Entity: Nothing to update', 'unprocessable Entity: Nothing to update')

    const noChangeResponse = yield dbCol.findOne({ username: 'ace' })
    t.equal(noChangeResponse.password, ace.password, '"ace" has not been updated')

    /****************************/

    const changeAdmin = {
      method: 'PATCH',
      url: '/user/ace',
      headers: {
        Authorization: token
      },
      payload: { isAdmin: true }
    }

    const changeAdminResult = yield server.inject(changeAdmin)
    t.equal(changeAdminResult.statusCode, 403, 'status code: 403')
    t.equal(changeAdminResult.statusMessage, 'Forbidden', 'status message: "Forbidden"')
    t.equal(changeAdminResult.result.message, 'You want to be admin? :D', 'you want to be admin? :D')

    const changeAdminResponse = yield dbCol.findOne({ username: 'ace' })
    t.equal(changeAdminResponse.isAdmin, false, '"ace" is not admin')

    /****************************/


    const updateAce = {
      method: 'PATCH',
      url: '/user/ace',
      headers: {
        Authorization: token
      },
      payload: { password: 'other_password' }
    }

    const aceResult = yield server.inject(updateAce)
    t.equal(aceResult.statusCode, 200, 'status code: 200')
    t.equal(aceResult.statusMessage, 'OK', 'status message: "OK"')
    t.equal(aceResult.result.message, 'User updated', 'user updated')

    const aceResponse = yield dbCol.findOne({ username: 'ace' })
    t.notEqual(aceResponse.password, ace.password, '"ace" has been updated')

    /****************************/

    const getUser = {
      method: 'GET',
      url: '/user/ace',
      headers: {
        Authorization: token
      }
    }

    const getUserResult = yield server.inject(getUser)
    t.equal(getUserResult.statusCode, 401, 'status code: 401')
    t.equal(getUserResult.statusMessage, 'Unauthorized', 'status message: "Unauthorized"')
    t.notOk(getUserResult.result.hasOwnProperty('users'), 'user list not returned')

    t.end()
    Db.close()

  }))()
})

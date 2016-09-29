'use strict'

const P = require('bluebird')
const Boom = require('boom')

const Util = require('./util')

function authentificate (req, collection) {
  return (P.coroutine(function* () {
    try {
      const response = {
        error: null,
        httpError: null,
        authUser: null
      }

      const user = Util.capitalized(req.payload.auth.user)
      const pass = req.payload.auth.pass

      const authUser = yield collection.findOne({ user_name: user })

      if (!authUser) {
        response.error = 'Unauthorized: Wrong credentials'
        response.httpError = Boom.unauthorized('Wrong credentials')
        return response
      }

      const result = yield Util.compareHash(pass, authUser.password)

      if (result === false) {
        response.error = 'Unauthorized: Wrong credentials'
        response.httpError = Boom.unauthorized('Wrong credentials')
        return response
      }

      response.authUser = authUser

      return response
    }
    catch(e) {
      throw e
    }
  }))()
}

module.exports = {
  authentificate
}

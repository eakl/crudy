'use strict'

const P = require('bluebird')
const Moment = require('moment')
const Bcrypt = require('bcrypt')
const Jwt = require('jwt-simple')
const Boom = require('boom')
const Hoek = require('hoek')

const Config = require('../config')

Hoek.assert(Config.apiKey, 'Secret Key is missing')

P.promisifyAll(Bcrypt)

function hash (pass, salt = 5) {
  return Bcrypt.hashAsync(pass, salt)
}

function compareHash (pass, hash) {
  return Bcrypt.compareAsync(pass, hash)
  .then((res) => res)
  .catch((e) => {
    throw e
  })
}

function createToken (user) {
  const claims = {
    iss: 'CRUDY',
    sub: user._id,
    iat: Moment().valueOf(),
    exp: Moment().add(7, 'days').valueOf(),
    scope: user.isAdmin ? ['admin', 'user'] : ['user']
  }

  return P.resolve(Jwt.encode(claims, Config.apiKey, 'HS256'))
}


function decodeToken (token) {
  return P.resolve(Jwt.decode(token, Config.apiKey))
}

function error(errorCategory) {
  return (errorMsg) => {
    const error = errorCategory.charAt(0).toUpperCase() + errorCategory.slice(1)
    console.log(`${error}: ${errorMsg}`)
    const httpError = Boom[errorCategory](errorMsg)

    return httpError.output.payload
  }
}

module.exports = {
  hash,
  compareHash,
  createToken,
  decodeToken,
  error
}

'use strict'

const P = require('bluebird')
const Moment = require('moment')
const Bcrypt = require('bcrypt')
const Jwt = require('jwt-simple')
const Joi = require('joi')
const Boom = require('boom')
const Hoek = require('hoek')

const Config = require('../config')

// Hoek.assert(process.env.TW_API_SECRET, 'TW_API_SECRET is missing')
Hoek.assert(Config.apiKey, 'SecretKey is missing')

P.promisifyAll(Bcrypt)
// P.promisifyAll(Jwt)

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
    iss: 'TW_API',
    sub: user._id,
    iat: Moment().valueOf(),
    exp: Moment().add('days', 7).valueOf(),
    scope: user.isAdmin ? ['admin', 'user'] : ['user']
  }

  return P.resolve(Jwt.encode(claims, Config.apiKey, 'HS256'))
}


function decodeToken (token) {
  return P.resolve(Jwt.decode(token, Config.apiKey))
}

function validateSchema (payload, schema) {
  const isValidPayload = Joi.validate(payload, schema)
  const error = isValidPayload.error
  const errorMsg = error ? error.details.map(x => x.message) : null

  return {
    error,
    errorMsg
  }
}

function error(errorCategory) {
  return (errorMsg) => {
    const error = errorCategory.charAt(0).toUpperCase() + errorCategory.slice(1)
    console.log(`${error}: ${errorMsg}`)
    const httpError = Boom[errorCategory](errorMsg)

    return JSON.stringify(httpError.output.payload, null, 2)
  }
}

module.exports = {
  hash,
  compareHash,
  createToken,
  decodeToken,
  validateSchema,
  error
}

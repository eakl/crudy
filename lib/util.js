'use strict'

const P = require('bluebird')
const Bcrypt = require('bcrypt')
const Joi = require('joi')

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

function capitalized (name) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
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

module.exports = {
  hash,
  compareHash,
  capitalized,
  validateSchema
}

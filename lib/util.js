'use strict'

const P = require('bluebird')
const Bcrypt = require('bcrypt')

P.promisifyAll(Bcrypt)

function encrypt (pass, salt = 5) {
  return Bcrypt.hashAsync(pass, salt)
}

function compare (pass, hash) {
  return Bcrypt.compareAsync(pass, hash)
  .then((err, res) => {
    if (err) {
      throw new Error('Failed to compare hash')
    }

    return res ? true : false
  })
}

module.exports = {
  encrypt,
  compare
}

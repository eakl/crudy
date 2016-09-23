'use strict'

const P = require('bluebird')
const Bcrypt = require('bcrypt')

P.promisifyAll(Bcrypt)

function encrypt (salt, pass) {
  return Bcrypt.hashAsync(pass, salt)
}

function decrypt () {
  
}

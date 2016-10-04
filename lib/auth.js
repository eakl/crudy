'use strict'

const P = require('bluebird')
const Moment = require('moment')
const Hoek = require('hoek')
const Boom = require('boom')
const Jwt = require('jwt-simple')

P.promisifyAll(Jwt)

const Util = require('./util')

const apiKey = 'secretkey'

// Hoek.assert(process.env.TW_API_SECRET, 'TW_API_SECRET is missing')
Hoek.assert(apiKey, 'SecretKey is missing')

function createToken (user) {
  const claims = {
    iss: 'TW_API',
    sub: user._id,
    iat: Moment().valueOf(),
    exp: Moment().add('days', 7).valueOf(),
    scope: user.isAdmin ? ['admin', 'user'] : ['user']
  }

  return P.resolve(Jwt.encode(claims, apiKey, 'HS256'))
}

function verifyCreds (req, collection) {
  return (P.coroutine(function* () {
    try {
      const auth = req.headers.authorization

      if (!auth) {
        return {
          error: 'Unauthorized: Wrong credentials',
          httpError: Boom.unauthorized('Wrong credentials')
        }
      }

      const base = auth.split(' ')
      const buff = Buffer.from(base[1], 'base64')
      const creds = buff.toString().split(':')
      const username = creds[0].toLowerCase()
      const password = creds[1]

      const user = yield collection.findOne({ username: username })

      if (!user) {
        return {
          error: 'Unauthorized: Wrong credentials',
          httpError: Boom.unauthorized('Wrong credentials')
        }
      }

      const userPass = yield Util.compareHash(password, user.password)

      if (userPass === false) {
        return {
          error: 'Unauthorized: Wrong credentials',
          httpError: Boom.unauthorized('Wrong credentials')
        }
      }

      const token = yield createToken(user)

      return {
        token,
        username
      }
    }
    catch(e) {
      throw e
    }
  }))()
}

function verifyToken (req, collection) {
  return (P.coroutine(function* () {
    try {
      const headerToken = (req.headers && (req.headers.authorization || req.headers['x-access-token']))
      const payloadToken = (req.payload && req.payload.access_token)
      const queryToken = (req.query && req.query.access_token)
      const token = headerToken || payloadToken || queryToken
      const segments = token ? token.split('.') : null

      if (!token || segments.length !== 3) {
        return {
          error: 'Unauthorized: Wrong credentials',
          httpError: Boom.unauthorized('Wrong credentials')
        }
      }

      const decoded = yield P.resolve(Jwt.decode(token, apiKey))
      const user = yield collection.findOne({ _id: decoded.sub })

      if (!user) {
        return {
          error: 'Unauthorized: Wrong credentials',
          httpError: Boom.unauthorized('Wrong credentials')
        }
      }

      const hasExpired = decoded.exp <= Moment().valueOf()
      const isRevoked = (user.lastModified && user.lastModified >= decoded.iat) ? true : false

      if (hasExpired || isRevoked) {
        return {
          error: 'Unauthorized: Access token has expired',
          httpError: Boom.unauthorized('Access token has expired')
        }
      }

      return {
        isValid: true,
        username: user.username,
        scope: decoded.scope
      }
    }
    catch(e) {
      throw e
    }
  }))()
}

module.exports = {
  createToken,
  verifyCreds,
  verifyToken
}

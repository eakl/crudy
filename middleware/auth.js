'use strict'

const Moment = require('moment')

const Db = require('../lib/db')
const Util = require('../lib/util')
const Col = require('../config').mongoCollection

const verifyCredentials = {
  method: Db.query(parseCredentials),
  assign: 'auth'
}

const verifyToken = {
  method: Db.query(parseToken),
  assign: 'auth'
}

function* parseCredentials (db, request, reply) {
  try {
    const dbCol = db.collection(Col.parseCredentials)

    const auth = request.headers.authorization

    if (!auth) {
      return reply(Util.error('unauthorized')('Wrong credentials')).code(401).takeover()
    }

    const base = auth.split(' ')
    const buff = Buffer.from(base[1], 'base64')
    const creds = buff.toString().split(':')
    const username = creds[0].toLowerCase()
    const password = creds[1]

    const user = yield dbCol.findOne({ username: username })

    if (!user) {
      return reply(Util.error('unauthorized')('Wrong credentials')).code(401).takeover()
    }

    const userPass = yield Util.compareHash(password, user.password)

    if (userPass === false) {
      return reply(Util.error('unauthorized')('Wrong credentials')).code(401).takeover()
    }

    const token = yield Util.createToken(user)

    return reply({ username, token })
  }
  catch(e) {
    throw e
  }
}

function* parseToken (db, request, reply) {
  try {
    const dbCol = db.collection(Col.parseToken)

    const headerToken = (request.headers && (request.headers.authorization || request.headers['x-access-token']))
    const payloadToken = (request.payload && request.payload.access_token)
    const queryToken = (request.query && request.query.access_token)
    const token = headerToken || payloadToken || queryToken
    const segments = token ? token.split('.') : null

    if (!token || segments.length !== 3) {
      return reply(Util.error('unauthorized')('Wrong credentials')).code(401).takeover()
    }

    const decoded = yield Util.decodeToken(token)
    const user = yield dbCol.findOne({ _id: decoded.sub })

    if (!user) {
      return reply(Util.error('unauthorized')('Wrong credentials')).code(401).takeover()
    }

    const hasExpired = decoded.exp <= Moment().valueOf()
    const isRevoked = (user.lastModified && user.lastModified >= decoded.iat) ? true : false

    if (hasExpired || isRevoked) {
      return reply(Util.error('unauthorized')('Access token has expired')).code(401).takeover()
    }

    reply({ isValid: true, username: user.username, scope: decoded.scope })
  }
  catch(e) {
    throw e
  }
}

module.exports = {
  verifyCredentials,
  verifyToken
}

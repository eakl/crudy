'use strict'

const Uuid = require('uuid')
const Boom = require('boom')
const Joi = require('joi')

const Db = require('../lib/db')
const Util = require('../lib/util')
const addUserSchema = require('../schema/adduser')

const db = Db.get()
const col = db.collection('users')

function home (req, rep) {
  rep('Welcome to TW API v1.')
}

function listUser (req, rep) {
  col
  .find()
  .toArray((err, users) => {
    if (err) {
      throw new Error()
    }
    const result = users.map((x) => x.user_name)
    rep(result)
  })
}

function addUser (req, rep) {

  const isValidJson = Joi.validate(req.payload, addUserSchema.payloadSchema)
  const hasAuth = Joi.validate(req.payload, addUserSchema.authSchema)
  const hasUserInfo = Joi.validate(req.payload, addUserSchema.userInfoSchema)

  const isValidJsonError = isValidJson.error
  const hasAuthError = hasAuth.error
  const hasUserInfoError = hasUserInfo.error

  const isValidJsonErrorMsg = isValidJsonError ? isValidJsonError.details.map(x => x.message) : null
  const hasAuthErrorMsg = hasAuthError ? hasAuthError.details.map(x => x.message) : null
  const hasUserInfoErrorMsg = hasUserInfoError ? hasUserInfoError.details.map(x => x.message) : null

  if (isValidJsonError) {
    console.log('Add User:', isValidJsonErrorMsg)
    const httpError = Boom.badRequest('Invalid request payload JSON format')
    return rep(httpError)
  }

  if (hasAuthError) {
    console.log('Add User - auth:', hasAuthErrorMsg)
    const httpError = Boom.unauthorized('You must provide authentification credentials')
    return rep(httpError)
  }
  if (hasUserInfoError) {
    console.log('Add User - data:', hasUserInfoErrorMsg)
    const httpError = Boom.badRequest('User information are required')
    return rep(httpError)
  }

  console.log('No errors')

  const authUser = req.payload.auth.user
  const authPass = req.payload.auth.pass

  const userId = Uuid.v1()
  const userName = req.payload.data.username
  const password = req.payload.data.password ? req.payload.data.password : Uuid.v4()

  if (!authUser || !authPass) {
    const error = Boom.unauthorized('This operation requires a User and a Password')
    return rep(error)
  }

  col
  .find({ isAdmin: true })
  .toArray((err, admins) => {
    if (err) {
      throw new Error()
    }
    const admin = admins.filter((x) => (x.user_name === authUser))

    if (admin.length === 0) {
      Boom.forbidden('You don\'t have the privileges for this operation')
    }

    Util.compare(authPass, admin.password)
    .then((res) => {
      const isAdmin = res ? true : false

      if (!isAdmin) {
        Boom.forbidden('You don\'t have the privileges for this operation')
      }

      if (isAdmin && !userName) {
        const error = Boom.badRequest('A username is required')
        return rep(error)
      }

      col
      .findOne({ user_name: userName }, (err, user) => {
        if (err) {
          throw new Error()
        }

        if (user.user_name === userName) {
          const error = 'The user already exists'
          rep(error)
        }

        Util.encrypt(password)
        .then((hash) => {
          col.insert({
            _id: userId,
            user_name: userName,
            password: hash,
            isAdmin: false
          })

          rep(`User ${userName} added -- Password: ${password}`)
        })
      })
    })
  })
}

// function deleteUser (req, rep) {}

// function updateUser (req, rep) {}

// function query (req, rep) {}

module.exports = {
  home,
  listUser,
  addUser
}

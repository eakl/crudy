'use strict'
// /*eslint no-unused-vars: 0*/

const Uuid = require('uuid')
const Boom = require('boom')

const Db = require('../lib/db')
const Util = require('../lib/util')
const UserSchema = require('../schema/user')

const db = Db.get()
const col = db.collection('users')

function home (req, rep) {
  const msg = 'Welcome to TW API v1.'
  console.log('Home -- ', msg)
  rep(msg).code(200)
}

function listAllUsers (req, rep) {
  col
  .find({})
  .toArray((err, users) => {
    if (err) {
      throw new Error()
    }
    const usersName = users.map((x) => x.user_name)
    console.log('List all users -- ', usersName)
    return rep(usersName).code(200)
  })
}

function listUser (req, rep) {
  const name = Util.capitalized(req.params.name)

  col
  .findOne({ user_name: name }, (err, user) => {
    if (err) {
      throw new Error()
    }

    if (!user) {
      console.log('Not Found: The user does not exist')
      const error = Boom.notFound('The user does not exist')
      return rep(error)
    }

    console.log('List user -- ', user)
    return rep(user).code(200)
  })
}

function addUser (req, rep) {

  const isValidPayload = Util.validateSchema(req.payload, UserSchema.addUser)

  if (isValidPayload.error) {
    console.log('Bad Request: ', isValidPayload.errorMsg)
    const error = 'Invalid request payload JSON format: ' + isValidPayload.errorMsg
    const httpError = Boom.badRequest(error)
    return rep(httpError)
  }

  const authUser = req.payload.auth.user
  const authPass = req.payload.auth.pass

  const userId = Uuid.v1()
  const userName = req.payload.data.username
  const password = req.payload.data.password ? req.payload.data.password : Uuid.v4()

  col
  .findOne({ user_name: authUser }, (err, user) => {
    if (err) {
      throw new Error()
    }

    if (!user) {
      console.log('Unauthorized: Wrong credentials')
      const error = Boom.unauthorized('Wrong credentials')
      return rep(error)
    }

    Util.compareHash(authPass, user.password)
    .then((res) => {
      if (res === false) {
        console.log('Unauthorized: Wrong credentials')
        const error = Boom.unauthorized('Wrong credentials')
        return rep(error)
      }

      const isAdmin = user.isAdmin === true

      if (!isAdmin) {
        console.log('Forbidden: You don\'t have the privileges for this operation')
        const error = Boom.forbidden('You don\'t have the privileges for this operation')
        return rep(error)
      }

      col
      .findOne({ user_name: userName }, (err, user) => {
        if (err) {
          throw new Error()
        }

        if (user) {
          console.log('Conflict: The user already exists')
          const error = Boom.conflict('The user already exists')
          return rep(error)
        }

        Util.hash(password)
        .then((hash) => {
          col.insert({
            _id: userId,
            user_name: userName,
            password: hash,
            isAdmin: false
          })

          console.log('Add user -- ')
          console.log('Username: ', userName)
          console.log('Password: ', password)
          rep(`User "${userName}" added -- Password: "${password}"`).code(201)
        })
        .catch((e) => {
          throw e
        })
      })
    })
    .catch((e) => {
      throw e
    })
  })
}

function deleteUser (req, rep) {

  const isValidPayload = Util.validateSchema(req.payload, UserSchema.deleteUser)

  if (isValidPayload.error) {
    console.log('Bad Request: ', isValidPayload.errorMsg)
    const error = 'Invalid request payload JSON format: ' + isValidPayload.errorMsg
    const httpError = Boom.badRequest(error)
    return rep(httpError)
  }

  const authUser = req.payload.auth.user
  const authPass = req.payload.auth.pass

  col
  .findOne({ user_name: authUser }, (err, user) => {
    if (err) {
      throw new Error()
    }

    if (!user) {
      console.log('Unauthorized: Wrong credentials')
      const error = Boom.unauthorized('Wrong credentials')
      return rep(error)
    }

    Util.compareHash(authPass, user.password)
    .then((res) => {
      if (res === false) {
        console.log('Unauthorized: Wrong credentials')
        const error = Boom.unauthorized('Wrong credentials')
        return rep(error)
      }

      const isAdmin = user.isAdmin === true

      if (!isAdmin) {
        console.log('Forbidden: You don\'t have the privileges for this operation')
        const error = Boom.forbidden('You don\'t have the privileges for this operation')
        return rep(error)
      }

      const name = Util.capitalized(req.params.name)

      if (name === authUser) {
        console.log('Locked: You can\'t delete yourself man')
        const error = Boom.locked('You can\'t delete yourself man')
        return rep(error)
      }

      col
      .findOne({ user_name: name }, (err, user) => {
        if (err) {
          throw new Error()
        }

        if (!user) {
          console.log('Not Found: The user does not exist')
          const error = Boom.notFound('The user does not exist')
          return rep(error)
        }

        col
        .remove({ user_name: user.user_name }, (err, nbrow) => {
          if (err) {
            throw new Error()
          }

          console.log('Delete user -- ', user.user_name)
          rep(`User removed: ${user.user_name}`).code(200)
        })
      })
    })
    .catch((e) => {
      throw e
    })
  })
}

function updateUser (req, rep) {
  return
}

// function query (req, rep) {}

module.exports = {
  home,
  listAllUsers,
  listUser,
  addUser,
  deleteUser,
  updateUser
}

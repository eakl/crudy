'use strict'
/*eslint no-unused-vars: 0*/

const P = require('bluebird')
const Uuid = require('uuid')
const Boom = require('boom')

const Db = require('../lib/db')
const Auth = require('../lib/auth')
const Util = require('../lib/util')
const UserSchema = require('../schema/user')

const db = Db.get()
const userCol = db.collection('users')

function home (req, rep) {
  const msg = 'Welcome to TW API v1.'
  console.log('Home -- ', msg)
  rep(msg).code(200)
}

function listAllUsers (req, rep) {
  (P.coroutine(function* () {
    try {
      const users = yield userCol.find({}).toArray()
      const usersname = users.map((x) => x.user_name)
      console.log('List all users -- ', usersname)
      return rep(usersname).code(200)
    }
    catch(e) {
      throw e
    }
  }))()
}

// Unhandled rejection when error. Try catch doesn't work ??
function listUser (req, rep) {
  (P.coroutine(function* () {
    try {
      const name = Util.capitalized(req.params.name)

      const user = yield userCol.findOne({ user_name: name })

      if (!user) {
        console.log('Not Found: The user does not exist')
        const error = Boom.notFound('The user does not exist')
        return rep(error)
      }

      console.log('List user -- ', user)
      return rep(user).code(200)
    }
    catch(e) {
      throw e
    }
  }))()
}

function addUser (req, rep) {
  (P.coroutine(function* () {
    try {
      const isValidPayload = Util.validateSchema(req.payload, UserSchema.addUser)

      if (isValidPayload.error) {
        console.log('Bad Request: ', isValidPayload.errorMsg)
        const error = 'Invalid request payload JSON format: ' + isValidPayload.errorMsg
        const httpError = Boom.badRequest(error)
        return rep(httpError)
      }

      const result = yield Auth.authentificate(req, userCol)

      if (result.httpError && result.httpError.isBoom) {
        console.log(result.error)
        return rep(result.httpError)
      }

      const isAdmin = result.authUser.isAdmin === true

      if (!isAdmin) {
        console.log('Forbidden: You don\'t have the privileges for this operation')
        const httpError = Boom.forbidden('You don\'t have the privileges for this operation')
        return rep(httpError)
      }

      const userId = Uuid.v1()
      const username = Util.capitalized(req.payload.data.username)
      const password = req.payload.data.password ? req.payload.data.password : Uuid.v4()

      const user = yield userCol.findOne({ user_name: username })

      if (user) {
        console.log('Conflict: The user already exists')
        const httpError = Boom.conflict('The user already exists')
        return rep(httpError)
      }

      const hash = yield Util.hash(password)

      yield userCol.insert({
        _id: userId,
        user_name: username,
        password: hash,
        isAdmin: false
      })

      console.log('Add user -- ')
      console.log('Username: ', username)
      console.log('Password: ', password)
      return rep(`User "${username}" added -- Password: "${password}"`).code(201)
    }
    catch(e) {
      throw e
    }
  }))()
}

function deleteUser (req, rep) {
  (P.coroutine(function* () {
    try {
      const isValidPayload = Util.validateSchema(req.payload, UserSchema.deleteUser)

      if (isValidPayload.error) {
        console.log('Bad Request: ', isValidPayload.errorMsg)
        const error = 'Invalid request payload JSON format: ' + isValidPayload.errorMsg
        const httpError = Boom.badRequest(error)
        return rep(httpError)
      }

      const result = yield Auth.authentificate(req, userCol)

      if (result.httpError && result.httpError.isBoom) {
        console.log(result.error)
        return rep(result.httpError)
      }

      const name = Util.capitalized(req.params.name)
      const isAdmin = (result.authUser.isAdmin === true) || (result.authUser.user_name === name)

      if (!isAdmin) {
        console.log('Forbidden: You don\'t have the privileges for this operation')
        const error = Boom.forbidden('You don\'t have the privileges for this operation')
        return rep(error)
      }

      if (name === result.authUser) { // try res.authUser to throw an exception. Doesn't work properly
        console.log('Locked: You can\'t delete yourself man')
        const error = Boom.locked('You can\'t delete yourself man')
        return rep(error)
      }

      const user = yield userCol.findOne({ user_name: name })

      if (!user) {
        console.log('Not Found: The user does not exist')
        const error = Boom.notFound('The user does not exist')
        return rep(error)
      }

      yield userCol.remove({ user_name: user.user_name })

      console.log('Delete user -- ', user.user_name)
      return rep(`User removed: ${user.user_name}`).code(200)
    }
    catch(e) {
      throw e
    }
  }))()
}

function updateUser (req, rep) {
  (P.coroutine(function* () {
    try {
      const isValidPayload = Util.validateSchema(req.payload, UserSchema.updateUser)

      if (isValidPayload.error) {
        console.log('Bad Request: ', isValidPayload.errorMsg)
        const error = 'Invalid request payload JSON format: ' + isValidPayload.errorMsg
        const httpError = Boom.badRequest(error)
        return rep(httpError)
      }

      const result = yield Auth.authentificate(req, userCol)

      if (result.httpError && result.httpError.isBoom) {
        console.log(result.error)
        return rep(result.httpError)
      }

      const name = Util.capitalized(req.params.name)
      const isAdmin = result.authUser.isAdmin === true
      const hasRight = result.authUser.user_name === name

      if (!isAdmin && !hasRight) {
        console.log('Forbidden: You don\'t have the privileges for this operation')
        const error = Boom.forbidden('You don\'t have the privileges for this operation')
        return rep(error)
      }

      const user = yield userCol.findOne({ user_name: name })

      if (!user) {
        console.log('Not Found: The user does not exist')
        const error = Boom.notFound('The user does not exist')
        return rep(error)
      }

      const data = req.payload.data
      const capUsername = data.username ? Util.capitalized(data.username) : null

      const hasChangedUsername = data.username ? (capUsername !== user.user_name) : false
      const hasChangedPassword = data.password ? !(yield Util.compareHash(data.password, user.password)) : false
      const hasChangedAdmin = data.isAdmin ? (data.isAdmin !== user.isAdmin) : false

      const updateObj = { }

      hasChangedUsername ? updateObj.user_name = capUsername : null
      hasChangedPassword ? updateObj.password = yield Util.hash(data.password) : null

      if (hasChangedAdmin) {
        if(!isAdmin) {
          console.log('Forbidden: You want to be admin? :D')
          const error = Boom.forbidden('You want to be admin? :D')
          return rep(error)
        }
        updateObj.isAdmin = data.isAdmin
      }

      const hasChanged = hasChangedUsername || hasChangedPassword || hasChangedAdmin

      if(!hasChanged) {
        console.log('Unprocessable Entity: Nothing to update')
        const error = Boom.badData('Nothing to update')
        return rep(error)
      }

      yield userCol.findOneAndUpdate({ user_name: name },
        { $set: updateObj,
          $currentDate: { 'lastModified': true }
        })

      const updatedUser = Object.assign({}, user, updateObj)

      console.log('Updated user -- ', updatedUser)
      console.log('Delta -- ', updateObj)
      return rep(`User updated: ${user}`).code(200)
    }
    catch(e) {
      throw e
    }
  }))()
}

function query (req, rep) {
  (P.coroutine(function* () {
    try {
      const isValidPayload = Util.validateSchema(req.payload, UserSchema.query)

      if (isValidPayload.error) {
        console.log('Bad Request: ', isValidPayload.errorMsg)
        const error = 'Invalid request payload JSON format: ' + isValidPayload.errorMsg
        const httpError = Boom.badRequest(error)
        return rep(httpError)
      }

      const result = yield Auth.authentificate(req, userCol)

      if (result.httpError && result.httpError.isBoom) {
        console.log(result.error)
        return rep(result.httpError)
      }

      const magic = req.params.nb

      if (Number(magic) === 42) {
        console.log('You got the magic number:', magic)
        return rep('You got the magic number: ' + magic).code(200)
      }

      return rep('Try again bro').code(200)
    }
    catch(e) {
      throw e
    }
  }))()
}

module.exports = {
  home,
  listAllUsers,
  listUser,
  addUser,
  deleteUser,
  updateUser,
  query
}

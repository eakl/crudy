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
  const response = {
    message: 'Welcome to TW API v1.'
  }

  console.log('Home --', response.message)

  rep(`${response}\n`).code(200)
}

function signup (req, rep) {
  (P.coroutine(function* () {
    try {
      const isValidPayload = Util.validateSchema(req.payload, UserSchema.signup)

      if (isValidPayload.error) {
        const error = 'Invalid request payload JSON format: ' + isValidPayload.errorMsg
        console.log('Bad Request: ', error)
        const httpError = Boom.badRequest(error)
        return rep(`${httpError}\n`)
      }

      const userId = Uuid.v1()
      const username = req.payload.username.toLowerCase()
      const password = req.payload.password

      const userExists = yield userCol.findOne({ username: username })

      if (userExists) {
        console.log('Conflict: The user already exists')
        const httpError = Boom.conflict('The user already exists')
        return rep(`${httpError}\n`)
      }

      const hash = yield Util.hash(password)

      const user = {
        _id: userId,
        username: username,
        password: hash,
        isAdmin: false
      }

      yield userCol.insert(user)

      let response = {
        message: `User added to the user base`,
        username: `${username}`,
        password: `${password}`
      }

      console.log(response.message)
      console.log('-----------')
      console.log(`Username: ${response.username}`)
      console.log(`Password: ${response.password}`)

      response = JSON.stringify(response, null, 2)

      return rep(`${response}\n`).code(201)
    }
    catch(e) {
      throw e
    }
  }))()
}

function login (req, rep) {
  (P.coroutine(function* () {
    try {
      const auth = yield Auth.verifyCreds(req, userCol)

      if (auth.httpError && auth.httpError.isBoom) {
        console.log(auth.error)
        return rep(`${auth.httpError}\n`)
      }

      let response = {
        message: `Login successful`,
        username: `${auth.username}`,
        token: `${auth.token}`
      }

      console.log(response.message)
      console.log('---------------')
      console.log(`Access Token: ${response.token}`)

      response = JSON.stringify(response, null, 2)

      return rep(`${response}\n`).code(201)
    }
    catch(e) {
      throw e
    }
  }))()
}


function listAllUsers (req, rep) {
  (P.coroutine(function* () {
    try {
      const token = yield Auth.verifyToken(req, userCol)

      if (!token.isValid) {
        console.log('Unauthorized: Wrong credentials')
        const httpError = Boom.unauthorized('Wrong credentials')
        return rep(`${httpError}\n`)
      }

      const users = yield userCol.find({}).toArray()
      const userlist = users.map((x) => x.username)

      let response = {
        message: `List all users present in the database`,
        users: userlist
      }

      console.log(response.message)
      console.log('------------------')
      console.log(response.users)

      response = JSON.stringify(response, null, 2)

      return rep(`${response}\n`).code(200)
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
      const token = yield Auth.verifyToken(req, userCol)

      if (!token.isValid) {
        console.log('Unauthorized: Wrong credentials')
        const httpError = Boom.unauthorized('Wrong credentials')
        return rep(`${httpError}\n`)
      }

      const username = req.params.name.toLowerCase()
      const user = yield userCol.findOne({ username: username })

      if (!user) {
        console.log('Not Found: The user does not exist')
        const httpError = Boom.notFound('The user does not exist')
        return rep(`${httpError}\n`)
      }

      user.password = '************'

      let response = {
        message: `User information`,
        user
      }

      console.log(response.message)
      console.log('-------')
      console.log(response.user)

      response = JSON.stringify(response, null, 2)

      return rep(`${response}\n`).code(200)
    }
    catch(e) {
      throw e
    }
  }))()
}

function deleteUser (req, rep) {
  (P.coroutine(function* () {
    try {
      const token = yield Auth.verifyToken(req, userCol)

      if (token.httpError && token.httpError.isBoom) {
        console.log(token.error)
        return rep(`${token.httpError}\n`)
      }

      let hasRight = token.scope ? token.scope.indexOf('admin') !== -1 : null

      if (!token.isValid) {
        console.log('Unauthorized: Wrong credentials')
        const httpError = Boom.unauthorized('Wrong credentials')
        return rep(`${httpError}\n`)
      }

      const username = req.params.name.toLowerCase()
      hasRight = hasRight || (username === token.username)

      if (!hasRight) { // try res.authUser to throw an exception. Doesn't work properly
        console.log('Forbidden: You don\'t have the privileges for this operation')
        const httpError = Boom.forbidden('You don\'t have the privileges for this operation')
        return rep(`${httpError}\n`)
      }

      // const user = yield userCol.findOne({ username: username })

      const result = yield userCol.findOneAndDelete({ username: username })
      console.log(result)

      if (result.ok !== 1) {
        console.log('Not Found: The user does not exist')
        const httpError = Boom.notFound('The user does not exist')
        return rep(`${httpError}\n`)
      }

      let response = {
        message: `User deleted`,
        user: username
      }

      console.log(response.message)
      console.log('------------')
      console.log(response.user)

      response = JSON.stringify(response, null, 2)

      return rep(`${response}\n`).code(200)
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
        const error = 'Invalid request payload JSON format: ' + isValidPayload.errorMsg
        console.log('Bad Request: ', error)
        const httpError = Boom.badRequest(error)
        return rep(`${httpError}\n`)
      }

      const token = yield Auth.verifyToken(req, userCol)

      if (token.httpError && token.httpError.isBoom) {
        console.log(token.error)
        return rep(`${token.httpError}\n`)
      }

      const isAdmin = token.scope ? token.scope.indexOf('admin') !== -1 : false

      if (!token.isValid) {
        console.log('Unauthorized: Wrong credentials')
        const httpError = Boom.unauthorized('Wrong credentials')
        return rep(`${httpError}\n`)
      }

      const username = req.params.name.toLowerCase()
      const hasRight = isAdmin || (username === token.username)

      if (!hasRight) {
        console.log('Forbidden: You don\'t have the privileges for this operation')
        const httpError = Boom.forbidden('You don\'t have the privileges for this operation')
        return rep(`${httpError}\n`)
      }

      const data = req.payload
      const obj = { }

      const updatedUsername = data.username ? obj.username = data.username : false
      const updatedPassword = data.password ? obj.password = yield Util.hash(data.password) : false
      const updatedAdmin = data.hasOwnProperty('isAdmin') ? true : false
      const hasChanged = updatedUsername || updatedPassword || updatedAdmin

      if(!hasChanged) {
        console.log('Unprocessable Entity: Nothing to update')
        const httpError = Boom.badData('Nothing to update')
        return rep(`${httpError}\n`)
      }

      if (updatedAdmin) {
        if(!isAdmin) {
          console.log('Forbidden: You want to be admin? :D')
          const httpError = Boom.forbidden('You want to be admin? :D')
          return rep(`${httpError}\n`)
        }
        obj.isAdmin = data.isAdmin
        obj._id = Uuid.v1()
      }

      const result = yield userCol.findOneAndUpdate({ username: username },
        { $set: obj,
          $currentDate: { 'lastModified': true }
        })

      const updatedUser = Object.assign({}, result.value, obj)

      let response = {
        message: `User updated`,
        user: updatedUser,
        delta: obj
      }

      console.log(response.message)
      console.log('------------')
      console.log(response.user)
      console.log(' ')
      console.log('Delta')
      console.log('------------')
      console.log(response.obj)

      response = JSON.stringify(response, null, 2)

      return rep(`${response}\n`).code(200)
    }
    catch(e) {
      throw e
    }
  }))()
}

module.exports = {
  home,
  signup,
  login,
  listAllUsers,
  listUser,
  deleteUser,
  updateUser
}

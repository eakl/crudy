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

function signup (req, rep) {
  (P.coroutine(function* () {
    try {
      const isValidPayload = Util.validateSchema(req.payload, UserSchema.signup)

      if (isValidPayload.error) {
        const error = 'Invalid request payload JSON format: ' + isValidPayload.errorMsg
        console.log('Bad Request: ', error)
        const httpError = Boom.badRequest(error)
        return rep(httpError)
      }

      const userId = Uuid.v1()
      const username = req.payload.username.toLowerCase()
      const password = req.payload.password

      const userExists = yield userCol.findOne({ username: username })

      if (userExists) {
        console.log('Conflict: The user already exists')
        const httpError = Boom.conflict('The user already exists')
        return rep(httpError)
      }

      const hash = yield Util.hash(password)

      const user = {
        _id: userId,
        username: username,
        password: hash,
        isAdmin: false
      }

      yield userCol.insert(user)

      console.log(`${username} added to the user base`)
      console.log('-----------')
      console.log(`Username: ${username}`)
      console.log(`Password: ${password}`)

      return rep(`
        ${username}, you have been added to the user base
        -----------
        Username: ${username}
        Password: ${password}
        `).code(201)
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
        return rep(auth.httpError)
      }

      console.log(`Token for user: ${auth.username}`)
      console.log('---------------')
      console.log(`Access Token: ${auth.token}`)

      return rep(auth.token).code(201)
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
        return rep(httpError)
      }

      const users = yield userCol.find({}).toArray()
      const usersname = users.map((x) => x.username)

      console.log('List of all users:')
      console.log('------------------')
      console.log(usersname)

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
      const token = yield Auth.verifyToken(req, userCol)

      if (!token.isValid) {
        console.log('Unauthorized: Wrong credentials')
        const httpError = Boom.unauthorized('Wrong credentials')
        return rep(httpError)
      }

      const username = req.params.name.toLowerCase()
      const user = yield userCol.findOne({ username: username })

      if (!user) {
        console.log('Not Found: The user does not exist')
        const httpError = Boom.notFound('The user does not exist')
        return rep(httpError)
      }

      user.password = '************'

      console.log(username)
      console.log('-------')
      console.log(user)

      return rep(user).code(200)
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
        return rep(token.httpError)
      }

      let hasRight = token.scope ? token.scope.indexOf('admin') !== -1 : null

      if (!token.isValid) {
        console.log('Unauthorized: Wrong credentials')
        const httpError = Boom.unauthorized('Wrong credentials')
        return rep(httpError)
      }

      const username = req.params.name.toLowerCase()
      hasRight = hasRight || (username === token.username)

      if (!hasRight) { // try res.authUser to throw an exception. Doesn't work properly
        console.log('Forbidden: You don\'t have the privileges for this operation')
        const httpError = Boom.forbidden('You don\'t have the privileges for this operation')
        return rep(httpError)
      }

      // const user = yield userCol.findOne({ username: username })

      const result = yield userCol.findOneAndDelete({ username: username })
      console.log(result)

      if (result.ok !== 1) {
        console.log('Not Found: The user does not exist')
        const httpError = Boom.notFound('The user does not exist')
        return rep(httpError)
      }

      console.log('User deleted')
      console.log('------------')
      console.log(username)

      return rep(username).code(200)
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
        return rep(httpError)
      }

      const token = yield Auth.verifyToken(req, userCol)

      if (token.httpError && token.httpError.isBoom) {
        console.log(token.error)
        return rep(token.httpError)
      }

      const isAdmin = token.scope ? token.scope.indexOf('admin') !== -1 : false

      if (!token.isValid) {
        console.log('Unauthorized: Wrong credentials')
        const httpError = Boom.unauthorized('Wrong credentials')
        return rep(httpError)
      }

      const username = req.params.name.toLowerCase()
      const hasRight = isAdmin || (username === token.username)

      if (!hasRight) {
        console.log('Forbidden: You don\'t have the privileges for this operation')
        const httpError = Boom.forbidden('You don\'t have the privileges for this operation')
        return rep(httpError)
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
        return rep(httpError)
      }

      if (updatedAdmin) {
        if(!isAdmin) {
          console.log('Forbidden: You want to be admin? :D')
          const httpError = Boom.forbidden('You want to be admin? :D')
          return rep(httpError)
        }
        obj.isAdmin = data.isAdmin
        obj._id = Uuid.v1()
      }

      const result = yield userCol.findOneAndUpdate({ username: username },
        { $set: obj,
          $currentDate: { 'lastModified': true }
        })

      const updatedUser = Object.assign({}, result.value, obj)
      console.log(updatedUser)


      console.log('User updated')
      console.log('------------')
      console.log(updatedUser)
      console.log(' ')
      console.log('Delta')
      console.log('------------')
      console.log(obj)

      return rep(updatedUser).code(200)
    }
    catch(e) {
      throw e
    }
  }))()
}

function query (req, rep) {
  (P.coroutine(function* () {
    try {
      const token = yield Auth.verifyToken(req, userCol)

      if (!token.isValid) {
        console.log('Unauthorized: Wrong credentials')
        const httpError = Boom.unauthorized('Wrong credentials')
        return rep(httpError)
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
  signup,
  login,
  listAllUsers,
  listUser,
  deleteUser,
  updateUser,
  query
}

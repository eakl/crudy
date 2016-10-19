'use strict'
/*eslint no-unused-vars: 0*/

const P = require('bluebird')
const Uuid = require('uuid')
const Boom = require('boom')

const Db = require('../lib/db')
const Auth = require('../middleware/auth')
const Util = require('../lib/util')
const Col = require('../config').mongoCollection
const UserSchema = require('../schema/user')

const db = Db.get()

function home (request, reply) {
  const response = {
    message: 'Welcome to TW API v1.'
  }

  console.log('Home --', response.message)

  reply(`${JSON.stringify(response, null, 2)}\n`).code(200)
}

function signup (request, reply) {
  (P.coroutine(function* () {
    try {
      const dbCol = db.collection(Col.signup)
      let { username, password } = request.payload
      username = username.toLowerCase()

      // const userId = Uuid.v1()
      // const username = req.payload.username.toLowerCase()
      // const password = req.payload.password

      const userExists = yield dbCol.findOne({ username: username })

      if (userExists) {
        return reply(`${Util.error('conflict')('The user already exists')}\n`)
      }

      const hash = yield Util.hash(password)

      const user = {
        _id: Uuid.v1(), //userId,
        username: username,
        password: hash,
        isAdmin: false
      }

      yield dbCol.insert(user)

      const response = {
        message: `User added to the user base`,
        username: `${username}`,
        password: `${password}`
      }

      console.log(response.message)
      console.log('-----------')
      console.log(`Username: ${response.username}`)
      console.log(`Password: ${response.password}`)

      return reply(`${JSON.stringify(response, null, 2)}\n`).code(201)
    }
    catch(e) {
      throw e
    }
  }))()
}

function login (request, reply) {
  (P.coroutine(function* () {
    try {
      const auth = request.pre.auth

      const response = {
        message: `Login successful`,
        username: `${auth.username}`,
        token: `${auth.token}`
      }

      console.log(response.message)
      console.log('---------------')
      console.log(`Access Token: ${response.token}`)

      return reply(`${JSON.stringify(response, null, 2)}\n`).code(201)
    }
    catch(e) {
      throw e
    }
  }))()
}

function listAllUsers (request, reply) {
  (P.coroutine(function* () {
    try {
      const dbCol = db.collection(Col.listAllUsers)

      const users = yield dbCol.find({}).toArray()
      const userlist = users.map((x) => x.username)

      const response = {
        message: `List all users present in the database`,
        users: userlist
      }

      console.log(response.message)
      console.log('------------------')
      console.log(response.users)

      return reply(`${JSON.stringify(response, null, 2)}\n`).code(200)
    }
    catch(e) {
      throw e
    }
  }))()
}

function listUser (request, reply) {
  (P.coroutine(function* () {
    try {
      const dbCol = db.collection(Col.listUser)

      const username = request.params.name.toLowerCase()
      const user = yield dbCol.findOne({ username: username })

      if (!user) {
        return reply(`${Util.error('notFound')('The user does not exist')}\n`)
      }

      user.password = '************'

      const response = {
        message: `User information`,
        user
      }

      console.log(response.message)
      console.log('-------')
      console.log(response.user)

      return reply(`${JSON.stringify(response, null, 2)}\n`).code(200)
    }
    catch(e) {
      throw e
    }
  }))()
}

function updateUser (request, reply) {
  (P.coroutine(function* () {
    try {
      const dbCol = db.collection(Col.updateUser)
      const auth = request.pre.auth

      const username = request.params.name.toLowerCase()
      const isAdmin = auth.scope ? auth.scope.indexOf('admin') !== -1 : false
      const hasRight = isAdmin || (username === auth.username)

      if (!hasRight) {
        return reply(`${Util.error('forbidden')('You don\'t have the privileges for this operation')}\n`)
      }

      const data = request.payload
      const obj = { }

      const updatedUsername = data.username ? obj.username = data.username : false
      const updatedPassword = data.password ? obj.password = yield Util.hash(data.password) : false
      const updatedAdmin = data.hasOwnProperty('isAdmin') ? true : false
      const hasChanged = updatedUsername || updatedPassword || updatedAdmin

      if(!hasChanged) {
        return reply(`${Util.error('badData')('Unprocessable Entity: Nothing to update')}\n`)
      }

      if (updatedAdmin) {
        if(!isAdmin) {
          return reply(`${Util.error('forbidden')('You want to be admin? :D')}\n`)
        }
        obj.isAdmin = data.isAdmin
        // obj._id = Uuid.v1()
      }

      const result = yield dbCol.findOneAndUpdate({ username: username },
        {
          $set: obj,
          $currentDate: { 'lastModified': true }
        })

      const updatedUser = Object.assign({}, result.value, obj)

      const response = {
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

      return reply(`${JSON.stringify(response, null, 2)}\n`).code(200)
    }
    catch(e) {
      throw e
    }
  }))()
}

function deleteUser (request, reply) {
  (P.coroutine(function* () {
    try {
      const dbCol = db.collection(Col.deleteUser)
      const auth = request.pre.auth

      const username = request.params.name.toLowerCase()
      const isAdmin = auth.scope ? auth.scope.indexOf('admin') !== -1 : false
      const hasRight = isAdmin || (username === auth.username)

      if (!hasRight) {
        return reply(`${Util.error('forbidden')('You don\'t have the privileges for this operation')}\n`)
      }

      const result = yield dbCol.findOneAndDelete({ username: username })

      if (result.ok !== 1) {
        return reply(`${Util.error('notFound')('The user does not exist')}\n`)
      }

      const response = {
        message: `User deleted`,
        user: username
      }

      console.log(response.message)
      console.log('------------')
      console.log(response.user)

      return reply(`${JSON.stringify(response, null, 2)}\n`).code(200)
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
  updateUser,
  deleteUser
}

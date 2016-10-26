'use strict'
/*eslint no-unused-vars: 0*/

const P = require('bluebird')
const Uuid = require('uuid')
const Boom = require('boom')

const Auth = require('../middleware/auth')
const Util = require('../lib/util')
const Col = require('../config').mongoCollection
const UserSchema = require('../schema/user')

function home (request, reply) {
  const response = {
    message: 'Welcome to CRUDY v1.'
  }

  console.log('Home --', response.message)

  return reply(response).code(200)
}

function* signup (db, request, reply) {
  try {
    const dbCol = db.collection(Col.signup)
    let { username, password } = request.payload
    username = username.toLowerCase()

    const userExists = yield dbCol.findOne({ username: username })

    if (userExists) {
      return reply(Util.error('conflict')('The user already exists')).code(409)
    }

    const hash = yield Util.hash(password)

    const user = {
      _id: Uuid.v1(),
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

    return reply(response).code(201)
  }
  catch(e) {
    throw e
  }
}

function* login (db, request, reply) {
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

    return reply(response).code(201)
  }
  catch(e) {
    throw e
  }
}

function* listAllUsers (db, request, reply) {
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

    return reply(response).code(200)
  }
  catch(e) {
    throw e
  }
}

function* listUser (db, request, reply) {
  try {
    const dbCol = db.collection(Col.listUser)

    const username = request.params.name.toLowerCase()
    const user = yield dbCol.findOne({ username: username })

    if (!user) {
      return reply(Util.error('notFound')('The user does not exist')).code(404)
    }

    user.password = '************'

    const response = {
      message: `User information`,
      user
    }

    console.log(response.message)
    console.log('-------')
    console.log(response.user)

    return reply(response).code(200)
  }
  catch(e) {
    throw e
  }
}

function* updateUser (db, request, reply) {
  try {
    const dbCol = db.collection(Col.updateUser)
    const auth = request.pre.auth

    const username = request.params.name.toLowerCase()
    const isAdmin = auth.scope ? auth.scope.indexOf('admin') !== -1 : false
    const hasRight = isAdmin || (username === auth.username)

    if (!hasRight) {
      return reply(Util.error('forbidden')('You don\'t have the privileges for this operation')).code(403)
    }

    const payload = request.payload
    const obj = { }

    const user = yield dbCol.findOne({ username: username })

    const updatedUsername = payload.username ? payload.username !== user.username : false
    const updatedPassword = payload.password ? !(yield Util.compareHash(payload.password, user.password)) : false
    const updatedAdmin = payload.hasOwnProperty('isAdmin') ? payload.isAdmin !== user.isAdmin : false
    const hasChanged = updatedUsername || updatedPassword || updatedAdmin

    if(!hasChanged) {
      return reply(Util.error('badData')('Unprocessable Entity: Nothing to update')).code(422)
    }

    if (updatedUsername) {
      obj.username = payload.username
    }
    if (updatedPassword) {
      obj.password = yield Util.hash(payload.password)
    }
    if (updatedAdmin) {
      if(!isAdmin) {
        return reply(Util.error('forbidden')('You want to be admin? :D')).code(403)
      }
      obj.isAdmin = payload.isAdmin
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
    console.log(response.delta)

    return reply(response).code(200)
  }
  catch(e) {
    throw e
  }
}

function* deleteUser (db, request, reply) {
  try {
    const dbCol = db.collection(Col.deleteUser)
    const auth = request.pre.auth

    const username = request.params.name.toLowerCase()
    const isAdmin = auth.scope ? auth.scope.indexOf('admin') !== -1 : false
    const hasRight = isAdmin || (username === auth.username)

    if (!hasRight) {
      return reply(Util.error('forbidden')('You don\'t have the privileges for this operation')).code(403)
    }

    const result = yield dbCol.findOneAndDelete({ username: username })

    if (result.ok !== 1) {
      return reply(Util.error('notFound')('The user does not exist')).code(404)
    }

    const response = {
      message: `User deleted`,
      user: username
    }

    console.log(response.message)
    console.log('------------')
    console.log(response.user)

    return reply(response).code(200)
  }
  catch(e) {
    throw e
  }
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

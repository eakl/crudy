'use strict'

const Db = require('../lib/db')

const UserService = require('../services/user')
const UserSchema = require('../schema/user')
const ValidationErrorMiddleware = require('../middleware/validation')
const AuthMiddleware = require('../middleware/auth')

module.exports = [

  // Root
  {
    method: 'GET',
    path: '/',
    handler: UserService.home
  },

  // Signup
  {
    method: 'POST',
    path: '/signup',
    config: {
      validate: {
        payload: UserSchema.signup,
        failAction: ValidationErrorMiddleware.formatError
      }
    },
    handler: Db.query(UserService.signup)
  },

  // Login
  {
    method: 'GET',
    path: '/login',
    config: {
      pre: [ AuthMiddleware.verifyCredentials ]
    },
    handler: Db.query(UserService.login)
  },

  // List All Users
  {
    method: 'GET',
    path: '/user',
    config: {
      pre: [ AuthMiddleware.verifyToken ]
    },
    handler: Db.query(UserService.listAllUsers)
  },

  // List One User
  {
    method: 'GET',
    path: '/user/{name}',
    config: {
      pre: [ AuthMiddleware.verifyToken ]
    },
    handler: Db.query(UserService.listUser)
  },

  // Update User
  {
    method: 'PATCH',
    path: '/user/{name}',
    config: {
      validate: {
        payload: UserSchema.updateUser,
        failAction: ValidationErrorMiddleware.formatError
      },
      pre: [ AuthMiddleware.verifyToken ]
    },
    handler: Db.query(UserService.updateUser)
  },

  // Delete User
  {
    method: 'DELETE',
    path: '/user/{name}',
    config: {
      pre: [ AuthMiddleware.verifyToken ]
    },
    handler: Db.query(UserService.deleteUser)
  }
]

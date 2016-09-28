'use strict'

const UserService = require('../services/user')
const UserSchema = require('../schema/user')

module.exports = [

  // Root
  {
    method: 'GET',
    path: '/',
    handler: UserService.home
  },

  // List All Users
  {
    method: 'GET',
    path: '/user',
    handler: UserService.listAllUsers
  },

  // List One User
  {
    method: 'GET',
    path: '/user/{name}',
    handler: UserService.listUser
  },

  // Add User
  {
    method: 'POST',
    path: '/user',
    handler: UserService.addUser//,
    // config: {
    //   validate: {
    //     payload: UserSchema.addUser
    //   }
    // }
  },

  // Delete User
  {
    method: 'DELETE',
    path: '/user/{name}',
    handler: UserService.deleteUser//,
    // config: {
    //   validate: {
    //     payload: UserSchema.deleteUser
    //   }
    // }
  },

  // Update User
  {
    method: 'GET',
    path: '/updateuser',
    handler: UserService.updateUser
  }

  // // Query Number
  // {
  //   method: 'GET',
  //   path: '/magic',
  //   handler:
  // }
]

'use strict'

const UserService = require('../services/user')

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
    handler: UserService.addUser
  },

  // Delete User
  {
    method: 'DELETE',
    path: '/user/{name}',
    handler: UserService.deleteUser
  },

  // Update User
  {
    method: 'PATCH',
    path: '/user/{name}',
    handler: UserService.updateUser
  },

  // // Query Number
  {
    method: 'POST',
    path: '/{nb}',
    handler: UserService.query
  }
]

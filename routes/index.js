'use strict'

const UserService = require('../services/user')

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
    handler: UserService.signup
  },

  // Login
  {
    method: 'GET',
    path: '/login',
    handler: UserService.login
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
  }
]

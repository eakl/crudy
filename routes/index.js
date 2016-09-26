'use strict'

const Api = require('../services/api')

module.exports = [

  // Root
  {
    method: 'GET',
    path: '/',
    handler: Api.home
  },

  // List User
  {
    method: 'GET',
    path: '/user',
    handler: Api.listUser
  },

  // Add User
  {
    method: 'POST',
    path: '/user',
    handler: Api.addUser
  }
  //
  // // Delete User
  // {
  //   method: 'GET',
  //   path: '/deleteuser',
  //   handler:
  // },
  //
  // // Update User
  // {
  //   method: 'GET',
  //   path: '/updateuser',
  //   handler:
  // },
  //
  // // Query Number
  // {
  //   method: 'GET',
  //   path: '/magic',
  //   handler:
  // }
]

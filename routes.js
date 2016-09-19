'use strict'

const Api = require('./api')

module.exports = [

  {
    method: 'GET',
    path: '/',
    handler: Api.home
  },

  // List User
  {
    method: 'GET',
    path: '/listuser',
    handler: Api.listUser
  },

  // Add User
  {
    method: 'POST',
    path: '/adduser',
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

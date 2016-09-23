'use strict'

const Db = require('../lib/db')
const Uuid = require('uuid')

const param = {
  host: 'localhost',
  port: '27017',
  db: 'tw-api'
}

const url = `mongodb://${param.host}:${param.port}/${param.db}`

function home (req, rep) {
  rep(`
    Welcome to TW API v1.
    You need to find the magic number by finding the right route
    API:
          /listuser       Lists all registered users
          /adduser        Adds a user
          /deleteuser     Deletes a user
          /updateuser     Updates a registered user
          /query          Query a specific number

`)
}

function listUser (req, rep) {
  // const col = db.collection('users')

  Db.connect(url)
  console.log(req)
  Db.close()
}

function addUser (req, rep) {

  Db.connect(url)
  .then(() => {
    console.log(JSON.stringify(req.payload, null, 2))
  })
  .then(Db.close)

  // const userId = uuid.v1()
  // const userName = user ||
  // const password = pass ||
}
//
// function deleteUser (req, rep) {}
//
// function updateUser (req, rep) {}
//
// function query (req, rep) {}

module.exports = {
  home,
  listUser,
  addUser
}

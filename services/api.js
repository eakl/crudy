'use strict'

const Uuid = require('uuid')

const Db = require('../lib/db2')
// const _db = Db.get() --> return undefined
const config = require('../config')

function home (req, rep) {
  rep('Welcome to TW API v1.')
}

function listUser (req, rep) {
  const _db = Db.get()
  // const col = db.collection('users')

  console.log('_db', _db)
  // console.log(req)
}

function addUser (req, rep) {

  console.log(JSON.stringify(req.payload, null, 2))

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

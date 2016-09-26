'use strict'

const Uuid = require('uuid')

const Db = require('../lib/db')
// const config = require('../config')
const Util = require('../lib/util')
const Boom = require('boom')
// const _db = Db.get() --> return undefined

function home (req, rep) {
  req
  rep('Welcome to TW API v1.')
}

function listUser (req, rep) {
  const data = req.payload
  const db = Db.get()
  const col = db.collection('users')

  col.find().toArray((err, users) => {
    if (err) {
      throw new Error()
    }
    const result = users.map((x) => x.user_name)
    rep(result)
  })
}

function addUser (req, rep) {
  const data = req.payload
  const db = Db.get()
  const col = db.collection('users')

  const userId = Uuid.v1()
  const userName = data.username
  const password = data.password ? data.password : Uuid.v4()

  if (!userName) {
    const error = Boom.badRequest('A username is required')
    return rep(error)
  }

  Util.encrypt(password)
  .then((hash) => {
    col.insert({
      _id: userId,
      user_name: userName,
      password: hash,
      isAdmin: false
    })

    rep(`User ${userName} added -- Password: ${password}`)
  })
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

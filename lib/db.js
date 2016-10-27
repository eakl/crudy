'use strict'

const P = require('bluebird')
const MongoClient = require('mongodb').MongoClient

const Config = require('../config')
let _db

function query (func) {
  return (request, reply) => {
    if (_db) {
      return P.coroutine(func)(_db, request, reply)
    }
    return connect().then(() => P.coroutine(func)(_db, request, reply))
  }
}

function connect () {
  if (_db) {
    return P.resolve(_db)
  }
  else {
    return MongoClient
    .connect(Config.mongoUrl, Config.mongoOptions)
    .then((db) => {
      _db = db
      console.log('Connected to MongoDB:', db.s.databaseName)
      return db
    })
    .catch((e) => {
      throw e
    })
  }
}

function close () {
  if (_db) {
    console.log('Closing MongoDB connection.')
    _db.close()
  }
}

module.exports = {
  query,
  connect,
  close
}

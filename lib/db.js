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
    return connect(Config.mongoUrl).then(() => P.coroutine(func)(_db, request, reply))
  }
}

function connect (url) {
  const _url = url || process.env.TW_API_MONGO_DB_URL

  return MongoClient.connect(_url, Config.mongoOptions)
  .then((db) => {
    _db = db
    console.log('Connected to MongoDB:', db.s.databaseName)
    return db
  })
  .catch((e) => {
    throw e
  })
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

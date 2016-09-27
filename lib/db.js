'use strict'

const MongoClient = require('mongodb').MongoClient

const config = require('../config')
let _db

function connect (url) {
  const _url = url || process.env.TW_API_MONGO_DB_URL
  return MongoClient.connect(_url, config.mongoOptions)
  .then((db) => {
    _db = db
    console.log('Connected to MongoDB:', db.s.databaseName)
    return db
  })
  .catch((e) => {
    throw e
  })
}

function get () {
  return _db ? _db : connect(config.mongoUrl).then(db => db)
}

function close () {
  if (_db) {
    console.log('Closing MongoDB connection.')
    _db.close()
  }
}

module.exports = {
  connect,
  close,
  get
}

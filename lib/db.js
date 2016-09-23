'use strict'

const MongoClient = require('mongodb').MongoClient

const config = require('../config')

let _db

function connect (_url) {
  const url = _url || process.env.TW_API_MONGO_DB_URL
  return MongoClient.connect(url, config.mongoConfig)
  .then((db) => {
    _db = db
    console.log('Connected to MongoDB:', db.s.databaseName)
  })
  .catch((e) => {
    console.error('MongoDB Error:', e.message)
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
  connect,
  close
}

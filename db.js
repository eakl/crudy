'use strict'

const MongoClient = require('mongodb').MongoClient

let _db

function connect (_url) {
  const url = _url || process.env.TW_API_MONGO_DB_URL
  return MongoClient.connect(url)
  .then((db) => {
    _db = db
    console.log('Connected to MongoDB:', db.s.databaseName)
    return _db
  })
  .catch((e) => {
    console.error('Boom:', e.message)
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

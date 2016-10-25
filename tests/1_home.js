'use strict'

const test = require('tape')
const server = require('../server')

test('Welcome Message', (t) => {
  const welcome = {
    method: 'GET',
    url: '/'
  }

  server.inject(welcome, (res) => {
    t.equal(res.result.message, 'Welcome to TW API v1.')
  })
  
  t.end()
})

'use strict'

const test = require('tape')
const server = require('../server')

test('return welcome message', (t) => {
  const opts = {
    method: 'GET',
    url: '/'
  }

  server.inject(opts, (res) => {
    t.equal(res.result.message, 'Welcome to CRUDY v1.')
  })

  t.end()
})

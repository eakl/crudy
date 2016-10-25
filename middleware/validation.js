'use strict'

const Util = require('../lib/util')

function formatError (request, reply, source, error) {
  const response = Util.error('badRequest')(`Invalid request payload JSON format: ${error.data.details[0].message}`)
  console.log(response)
  return reply(response).code(400)
}

module.exports = {
  formatError
}

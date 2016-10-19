'use strict'

function formatError (request, reply, source, error) {
  const response = {
    statusCode: error.output.payload.statusCode,
    error: error.output.payload.error,
    message: `Invalid request payload JSON format: ${error.data.details[0].message}`,
    source: error.output.payload.validation.source
  }
  console.log(response)
  return reply(JSON.stringify(response, null, 2))
}

module.exports = {
  formatError
}

'use strict'

function getToken (server, creds) {
  const opts = {
    method: 'GET',
    url: '/login',
    headers: {
      Authorization: 'Basic ' + Buffer.from(creds).toString('base64')
    }
  }

  return server.inject(opts).then((res) => res.result.token)
}

module.exports = {
  getToken
}

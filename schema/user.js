'use strict'

const Joi = require('joi')

const signup = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required()
}).required()

const updateUser = Joi.object().keys({
  username: Joi.string().optional(),
  password: Joi.string().optional(),
  isAdmin: Joi.boolean().optional()
}).or('username', 'password', 'isAdmin').required()

module.exports = {
  signup,
  updateUser
}

'use strict'

const Joi = require('joi')

// const payloadSchema = Joi.object().keys({
//   auth: Joi.object().keys({
//     user: Joi.string().insensitive().required(),
//     pass: Joi.string().required()
//   }).required(),
//   data: Joi.object().keys({
//     username: Joi.string().insensitive().required(),
//     password: Joi.string().optional()
//   }).required()
// }).required()
//
// const authSchema = payloadSchema.optionalKeys('data', 'data.username')
// const usernameSchema = payloadSchema.optionalKeys('auth', 'auth.user', 'auth.pass')



const payloadSchema = Joi.object().keys({
  auth: Joi.object().required(),
  data: Joi.object().required()
}).required()

const authSchema = {
  user: Joi.string().insensitive().required(),
  pass: Joi.string().required()
}

const userInfoSchema = {
  username: Joi.string().insensitive().required(),
  password: Joi.string().optional()
}

module.exports = {
  addUserValidation: {
    validate: {
      payload: payloadSchema
    }
  },
  payloadSchema,
  authSchema,
  userInfoSchema
}

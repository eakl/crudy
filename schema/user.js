'use strict'

const Joi = require('joi')

const addUser = Joi.object().keys({
  auth: Joi.object().keys({
    user: Joi.string().insensitive().required() ,
    pass: Joi.string().required()
  }).required(),
  data: Joi.object().keys({
    username: Joi.string().insensitive().required(),
    password: Joi.string().optional()
  }).required()
}).required()

const updateUser = Joi.object().keys({
  auth: Joi.object().keys({
    user: Joi.string().insensitive().required() ,
    pass: Joi.string().required()
  }).required(),
  data: Joi.object().keys({
    username: Joi.string().insensitive().optional(),
    password: Joi.string().optional(),
    isAdmin: Joi.boolean().optional(),
    lastModified: Joi.date().optional()
  }).required()
}).required()

const deleteUser = Joi.object().keys({
  auth: Joi.object().keys({
    user: Joi.string().insensitive().required() ,
    pass: Joi.string().required()
  }).required()
}).required()

const query = Joi.object().keys({
  auth: Joi.object().keys({
    user: Joi.string().insensitive().required() ,
    pass: Joi.string().required()
  }).required()
}).required()

module.exports = {
  addUser,
  updateUser,
  deleteUser,
  query
}

//VALIDATION
const Joi = require('joi')

//REGISTER Validation
const registerValidation = (data) => {
  const schema = Joi.object().keys({
    name: Joi.string().min(2).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().min(6).required(),
  })
  const result = schema.validate(data)
  // console.log(result)
  return result
}
//LOGIN Validation
const loginValidation = (data) => {
  const schema = Joi.object().keys({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
  })
  const result = schema.validate(data)
  return result
}

module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation

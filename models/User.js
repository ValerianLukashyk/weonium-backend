const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);



const userSchema = new mongoose.Schema({
  localId: {
    type: Number,
  },
  id: {
    type: Number,
    required: false,
  },
  given_name: {
    type: String,
    required: false,
    min: 2,
    max: 50,
  },
  family_name: {
    type: String,
    required: false,
    min: 2,
    max: 50,
  },
  displayName: {
    type: String
  },
  email_verified: {
    type: Boolean
  },
  verified: {
    type: Boolean
  },
  language: {
    type: String,
    default: 'eng'
  },
  picture: {
    type: String
  },
  email: {
    type: String,
    required: true,
    max: 255,
    min: 6,
  },
  password: {
    type: String,
    required: true,
    max: 1024,
    min: 6,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isAuth: {
    type: Boolean,
    required: false,
    default: false,
  },
  token: {
    type: String,
    required: false
  },
  provider: {
    type: String,
  },
  superuser: {
    type: Boolean,
    default: false
  }
})

userSchema.plugin(AutoIncrement, { inc_field: 'localId' });

module.exports = mongoose.model('User', userSchema)

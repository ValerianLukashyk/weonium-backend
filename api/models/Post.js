const mongoose = require('mongoose')

const PostSchema = mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  slug: {
    type: String,
  },
  period: {
    type: String,
    require: true
  },
  stack: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  url: {
    type: String,
    require: true,
  },
  screenshots: [],
  videos: [],
  date: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Posts', PostSchema)

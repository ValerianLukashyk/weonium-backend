const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const WorksSchema = mongoose.Schema({

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
  description: {
    type: String,
    require: true,
  },
  url: {
    type: String,
    require: true,
  },
  stack: {
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
WorksSchema.plugin(AutoIncrement, { inc_field: 'id' });

module.exports = mongoose.model('Works', WorksSchema)

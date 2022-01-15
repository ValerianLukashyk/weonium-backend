const mongoose = require('mongoose')

const siteSchema = new mongoose.Schema({
    helloMessage: {
        type: String,
    },
    name: {
        type: String,
        min: 6,
        max: 50,
    },
    position: {
        type: String,
        max: 255,
        min: 6,
    },
    workTitle: {
        type: String,
    },
    workDescription: {
        type: String
    },
    bioTitle: {
        type: String
    },

})

module.exports = mongoose.model('SiteSettings', siteSchema)

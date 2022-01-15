const mongoose = require('mongoose')

const authSchema = new mongoose.Schema({
    isAuth: {
        type: Boolean,
    },
    name: {
        type: String,
        min: 6,
        max: 50,
    },
    id: {
        type: String,
        max: 255,
        min: 6,
    },

})

module.exports = mongoose.model('Auth', authSchema)

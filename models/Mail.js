const mongoose = require('mongoose')

const MailSchema = mongoose.Schema({
    from: {
        type: String,
        require: true,
    },
    to: {
        type: String,
        require: true,
    },
    subject: {
        type: String,
        require: false,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    text: {
        type: String,
        required: false,
    },
    html: {
        type: String,
        required: false,
    },
})

module.exports = mongoose.model('Mails', MailSchema)

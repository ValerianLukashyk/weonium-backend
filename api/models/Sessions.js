const mongoose = require('mongoose')

module.exports = function () {
    var Sessions = new mongoose.Schema({
        session: {
            lastAccess: Date,
            cookie: {
                originalMaxAge: Date,
                expires: Date,
                httpOnly: Boolean,
                path: String
            },
            "_csrf": String
        },
        expires: Date
    });
    return db.model('Sessions', Sessions);
};
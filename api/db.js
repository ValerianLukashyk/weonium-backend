const mongoose = require('mongoose');
// require('dotenv/config')

//Connect to DB
mongoose
    .connect(process.env.DB_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('----> Database Ready')
    })
    .catch((err) => console.log(err))

const db = mongoose.connection

module.exports = db
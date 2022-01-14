require('dotenv').config()
const express = require('express');
const app = express();
require('./auth');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const db = require('./db')
const MongoStore = require('connect-mongo');
const initRoutes = require("./routes/web");
//IMPORT ROUTES
const postsRoute = require('./routes/posts')
const worksRoute = require('./routes/works')
const authRoute = require('./routes/auth')
const settingsRoute = require('./routes/siteSettings')


const bodyParser = require('body-parser');

// Connect to DB
db.on('error', console.error.bind(console, 'MongoDB connection error:'))


app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  cookie: { maxAge: 360000 },
  store: MongoStore.create({
    mongoUrl: process.env.DB_CONNECTION
  }),
  name: process.env.SESSIONS_NAME,
  secret: process.env.SESSIONS_SECRET,
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use('/upload', express.static('upload'))

//TODO: Rename Posts to WebGL  Works
app.use('/posts', postsRoute)

app.use('/works', worksRoute)
app.use('/auth', authRoute)
app.use('/settings', settingsRoute)
initRoutes(app)

// ROUTES
app.get('/', (req, res) => {
  res.send("<h1>Hello man!</h1>")
})

//LISTENING
const port = process.env.SERVER_PORT || 8000
app.listen(port, () => console.log(`Server started at http://localhost/  on port => ${process.env.SERVER_PORT}`))

console.log('You are on Weonium Web Server. Welcome!')


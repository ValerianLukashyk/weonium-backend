const router = require('express').Router()
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { registerValidation, loginValidation } = require('../validation')
const bcrypt = require('bcryptjs')
const verify = require('../routes/verifyToken');
const passport = require('passport');
const generator = require('generate-password');
const nodemailer = require("nodemailer");

async function sendConfirmationMail(req, res) {
    let transporter = nodemailer.createTransport({
        host: "smtp.titan.email",
        port: 465,
        secure: true,
        auth: {
            user: "valerian@weonium.space",
            pass: "sanpedro1990",
        },
    });

    let info = await transporter.sendMail({
        from: '"Weonium" <valerian@weonium.space>',
        to: "space.onion23@gmail.com",
        subject: "Hello",
        text: "Hello world?",
        html: "<b>Hello world?</b>",
    });
    
    res.send(info)
    console.log("Message sent: %s", info);
}
// CHECK IF GOOGLE CALLBACK HAVE USER obj
function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401)
}
// REGISTER ROUTE
router.post('/register', async (req, res) => {
  //VALIDATE THE DATA BEFORE WE MAKING A USER
  const { error } = registerValidation(req.body)
  if (error) return res.status(400).send('Something goes wrong')

  //Checking if user is already in DB
  const emailExist = await User.findOne({
    email: req.body.email,
  })
  if (emailExist) return res.status(400).send('Email already exist')
  if (req.body.password !== req.body.confirmPassword) return res.status(400).send('Passwords not match')
  //HASH THE PASSWORD
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(req.body.password, salt)

  //Create a new User
  const user = new User({
    displayName: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    email_verified: false,
    verified: false,
    provider: 'local',
  })
  try {
    const savedUser = await user.save()
    
    res.status(200).send({ savedUser })
    
    console.log('REGISTER NEW ACCOUNT')
  } catch (err) {
    res.status(400).send('Sorry :( something goes wrong :(')
  }
}, sendConfirmationMail)

//LOGIN ROUTE
router.post('/login', async (req, res, next) => {
  //VALIDATE THE DATA BEFORE WE LOGIN
  const { error } = loginValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  //Checking if email exist
  const user = await User.findOne({
    email: req.body.email,
  })
  if (!user) return res.status(400).send('Email or password is wrong')
  //PASSWORD IS CORRECT
  const validPass = await bcrypt.compare(req.body.password, user.password)
  if (!validPass) return res.status(400).send('Invalid password')

  //Create and assign a token
  const token = await jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
  user.isAuth = true
  user.token = token
  await user.save()
  console.log('authed')
  res.header('auth-token', token).send(token)

})

// PASSPORT LOCAL LOGIN
router.post('/local-login', function (req, res) {
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.

  res.redirect('/profile')
});

router.get('/local-login/success', async (req, res, next) => {

})

// GOOGLE AUTH ROUTE
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }))

// ROUTE FOR ACCEPT GOOGLE CALLBACK
router.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/auth/accept',
  failureRedirect: '/auth/failure',
}))

// IF GOOGLE SIGN IN FAILURE
router.get('/failure', (req, res) => {
  res.send('Something went wrong...')
})

// IF GOOGLE SIGN IN ACCEPTED REDIRECT TO FRONTEND PROFILE PAGE
router.get('/accept', async (req, res, next) => {
  // console.log(req.user)
  const user = await User.findOne({
    email: req.user.email,
  }).catch((error) => {
    res.send('error with sending data to client ---->', error)
  })
  if (!user) {

    const password = generator.generate({
      length: 16,
      numbers: true
    });
    //HASH THE PASSWORD
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = new User({
      id: req.user.id,
      displayName: req.user.displayName,
      given_name: req.user.given_name,
      family_name: req.user.family_name,
      email: req.user.email,
      email_verified: req.user.email_verified,
      verified: req.user.verified,
      language: req.user.language,
      picture: req.user.picture,
      password: hashedPassword,
    })
    try {
      const savedUser = await user.save()
      const token = jwt.sign({ _id: savedUser._id }, process.env.TOKEN_SECRET)
      const doc = await User.findById(savedUser._id);
      doc.isAuth = true;
      doc.token = token;
      await doc.save();
      res.header('auth-token', token).redirect(`http://localhost/redirect/${token}`)
    } catch (err) {
      res.status(400).send(err)
    }
  } else {
    if (req.email_verified === false) {
      res.status(401).redirect(`http://localhost/redirect/notverified?email=notverified`)
      console.log('unverified!!')
    } else {
      if (!user.id) user.id = req.user.id
      if (!user.displayName) user.displayName = req.user.displayName
      if (!user.given_name) user.given_name = req.user.given_name
      if (!user.family_name) user.family_name = req.user.family_name
      if (!user.email_verified) user.email_verified = req.user.email_verified
      if (!user.language) user.language = req.user.language
      if (!user.picture) user.picture = req.user.picture

      await user.save()
      console.log('profile updated')
      //Create and assign a token
      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
      const doc = await User.findById(user._id);
      doc.isAuth = true;
      doc.token = token;
      await doc.save();
      res.header('auth-token', token).redirect(`http://localhost/redirect/${token}`)
    }

  }

})

// LOGOUT ROUTE
router.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy()
  res.redirect('/')
})

// CHECK IF isAuth?
router.get('/me', verify, async (req, res) => {
  console.log(req.user._id)
  const user = await User.findOne({
    _id: req.user._id
  }).catch((error) => {
    res.send(error)
  })
  res.send(user)
})


module.exports = router

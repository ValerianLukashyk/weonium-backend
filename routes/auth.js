const router = require('express').Router()
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { registerValidation, loginValidation } = require('../validation')
const bcrypt = require('bcryptjs')
const verify = require('../routes/verifyToken');
const passport = require('passport');
const generator = require('generate-password');
const sendMailController = require("../controllers/mail");
const uploadController = require("../controllers/imageUploads");


// UPLOAD PROFILE AVATAR
router.post('/photo-upload/:id', verify, uploadController.uploadImages, uploadController.resizeImages, async (req,res,next)=>{
  if (req.body.images.length <= 0) {
    return res.send(`You must select at least 1 image.`);
  }

  const images = req.body.images
    .map(image => `/upload/${image}`)

    const updatedUser = await User.updateOne(
      { _id: req.params.id },
      {
        $set: {
          picture: process.env.SERVER_URL +":"+process.env.SERVER_PORT+images[0]
        }
      }
    )

    const user = await User.findOne({ _id: req.params.id })

    res.send({message: "Profile picture has updated", url: user.picture})

})

// REGISTER ROUTE
router.post('/register', async (req, res) => {

  //VALIDATE THE DATA BEFORE WE MAKING A USER
  const { error } = registerValidation(req.body)
  if (error) return res.status(400).send(error)

  //Checking if user is already in DB
  const emailExist = await User.findOne({
    email: req.body.email,
  })
  if (emailExist) return res.status(400).send('Email already exist')
  if (req.body.password !== req.body.confirmPassword) return res.status(400).send('Passwords not match')

  //HASH THE PASSWORD
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(req.body.password, salt)

  // CREATE TOKEN FOR EMAIL CONFIRMATION
  const token = jwt.sign({ email: req.body.email }, process.env.TOKEN_SECRET)

  //Create a new User
  const user = new User({
    displayName: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    confirmationCode: token,
    provider: 'local',
  })
  try {
    const savedUser = await user.save()
    const info = await sendMailController.sendConfirmEmail(
      savedUser.displayName,
      savedUser.email,
      savedUser.confirmationCode
    );
    res.send({ message: info })
  }
  catch (err) {
    res.status(400).send('Sorry, but something goes wrong. Try again')
  }
})

// Confirm EMAIL
router.get("/confirm/:confirmationCode", (req, res, next) => {

  User.findOne({
    confirmationCode: req.params.confirmationCode,
  })
    .then((user) => {
      if (!user) {
        console.log('User not found')
        return res.status(404).send({ message: "User Not found." });
      }

      user.status = "Active";
      user.email_verified = true
      user.verified = true
      user.save((err) => {
        if (err) {
          console.log('Failed to save User')
          res.status(500).send({ message: err });
          return;
        } else {
          res.status(200).send({ message: "Your Email address was confirmed!" });
        }
      });
    })
    .catch((e) => console.log("error", e));
})

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

  if (user.status != "Active") {
    return res.status(401).send({
      message: "Pending Account. Please Verify Your Email!",
    });
  }

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

// GOOGLE AUTH LOGIN
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }))

// GOOGLE CALLBACKS ROUTES
router.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/auth/accept',
  failureRedirect: '/auth/failure',
}))

// FAILURE GOOGLE CALLBACK
router.get('/failure', (req, res) => {
  res.send('Something went wrong...')
})

// SUCCESS GOOGLE CALLBACK
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

// GET AUTH INFO
router.get('/me', verify, async (req, res) => {
  const user = await User.findOne({
    _id: req.user._id
  }).catch((error) => {
    res.send(error)
  })
  res.send(user)
})

module.exports = router

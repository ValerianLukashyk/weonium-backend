const express = require('express')
const router = express.Router()
const Works = require('../models/Works')
const verify = require('./verifyToken')
const uploadController = require("../controllers/imageUploads");

//GET BACK ALL THE WORKS
router.get('/', async (req, res) => {
  try {
    const works = await Works.find()
    res.json(works)
  } catch (err) {
    res.json({ message: err })
  }
})

// router.post('/uploadVideo', videoUpload.single('video'), (req, res) => {
//   res.send(req.file)
// }, (error, req, res, next) => {
//   res.status(400).send({ error: error.message })
// })

//CREATE A NEW WORK
router.post('/', verify, uploadController.uploadImages, uploadController.resizeImages, async (req, res) => {
  if (req.body.images.length <= 0) {
    return res.send(`You must select at least 1 image.`);
  }

  const images = req.body.images
    .map(image => `/upload/${image}`)
  const videos = req.body.videos
    .map(vid => `/upload/${vid}`)

  const work = await new Works({
    title: req.body.title,
    slug: req.body.title.toLowerCase(),
    description: req.body.description,
    period: req.body.period,
    url: req.body.url,
    stack: req.body.stack,
    screenshots: images,
    videos: videos

  })
  try {
    const savedWork = await work.save()
    res.send(savedWork)
    console.log('One more work has been added!')
  } catch (err) {
    res.json({ message: err })
  }
})

//SPECIFIC WORK
router.get('/:slug', async (req, res) => {
  try {
    const work = await Works.findOne({ slug: req.params.slug })
    res.send(work)
  } catch (err) {
    res.json({ message: err })
  }
})

//DELETE SPECIFIC WORK
router.delete('/:title', verify, async (req, res) => {
  try {
    const removedWork = await Works.deleteOne({ title: req.params.title })
    res.json(removedWork)
    console.log('Post with title "' + req.params.title + '" has been deleted')
  } catch (err) {
    res.json({ message: err })
  }
})

//UPDATE A WORK
router.patch('/:title', verify, async (req, res) => {
  try {
    const updatedWork = await Works.updateOne(
      { title: req.params.title },
      {
        $set: {
          title: req.body.title,
          slug: req.body.title.toLowerCase(),
          description: req.body.description,
          period: req.body.period,
          url: req.body.url,
          stack: req.body.stack,
          screenshots: images,
        }
      }
    )
    
    res.json(updatedWork)
  } catch (err) {
    res.json({ message: err })
  }
})

module.exports = router

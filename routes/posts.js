const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const verify = require('./verifyToken')
const uploadController = require("../controllers/imageUploads");

//GET BACK ALL THE POSTS
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
    res.json(posts)
  } catch (err) {
    res.json({ message: err })
  }
})

//CREATE A NEW POST
router.post('/', verify, uploadController.uploadImages, uploadController.resizeImages, async (req, res) => {
  if (req.body.images.length <= 0) {
    return res.send(`You must select at least 1 image.`);
  }

  const images = req.body.images
    .map(image => `/upload/${image}`)
  
  const glWork = await new Post({
    title: req.body.title,
    slug: req.body.title.toLowerCase().replace(/\s/g, "-"),
    description: req.body.description,
    url: req.body.url,
    screenshots: images,
  })
  try {
    const savedGLWork = await glWork.save()
    res.send(savedGLWork)
    console.log('One more glWork has been added!')
  } catch (err) {
    res.json({ message: err })
  }
})


//GET SPECIFIC POST
router.get('/:slug', async (req, res) => {
  console.log(req.params)
  try {
    const post = await Post.findOne({ slug: req.params.slug })
    res.json(post)
    console.log('Look at post' + req.params.slug)
  } catch (err) {
    res.json({ message: err })
  }
})

//DELETE SPECIFIC POST
router.delete('/:slug', verify, async (req, res) => {
  try {
    const removedPost = await Post.deleteOne({ slug: req.params.slug })
    res.json(removedPost)
    console.log('Post id: ' + req.params.slug + ' has been deleted')
  } catch (err) {
    res.json({ message: err })
  }
})

//UPDATE A POST
router.patch('/:postId', verify, async (req, res) => {
  try {
    const updatedPost = await Post.updateOne(
      { _id: req.params.postId },
      { $set: { title: req.body.title } }
    )
    console.log(
      'Post id: ' +
      req.params.postId +
      'has been updated. ' +
      'New title: ' +
      req.body.title
    )
    res.json(updatedPost)
  } catch (err) {
    res.json({ message: err })
  }
})

module.exports = router

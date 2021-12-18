const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const verify = require('./verifyToken')
const uploadController = require("../controllers/imageUploads");

//GET BACK ALL THE POSTS
router.get('/', verify, async (req, res) => {
  try {
    const posts = await Post.find()
    res.json(posts)
  } catch (err) {
    res.json({ message: err })
  }
})

//CREATE A NEW POST
router.post('/', verify, async (req, res) => {
  const post = new Post({
    title: req.body.title,
    description: req.body.description,

  })
  try {
    const savedPost = await post.save()
    res.json(savedPost)
    console.log('One more post has been created!')
  } catch (err) {
    res.json({ message: err })
  }
})

// ADD PICTURE TO SPECIFIC POST
router.post('/image/:postId',
  verify,
  uploadController.uploadPostImage,
  uploadController.resizeImages,
  async (req, res) => {
    if (req.body.picture.length <= 0) {
      return res.send(`You must select at least 1 image.`);
    }

    const image = "http://localhost:5000/upload/" + req.body.picture


    try {

      const updatedPost = await Post.updateOne(
        { _id: req.params.postId },
        { $set: { picture: image } }
      )
      res.json(updatedPost)
    } catch (err) {
      res.json({ message: err })
    }
  })


//GET SPECIFIC POST
router.get('/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
    res.json(post)
    console.log('Look at post' + req.params.postId)
  } catch (err) {
    res.json({ message: err })
  }
})

//DELETE SPECIFIC POST
router.delete('/:postId', verify, async (req, res) => {
  try {
    const removedPost = await Post.remove({ _id: req.params.postId })
    res.json(removedPost)
    console.log('Post id: ' + req.params.postId + 'has been deleted')
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

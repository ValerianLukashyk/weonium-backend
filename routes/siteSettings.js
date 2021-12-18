const express = require('express')
const router = express.Router()
const SiteSettings = require('../models/SiteSettings')

//GET BACK ALL SETTINGS
router.get('/', async (req, res) => {
    try {
        const data = await SiteSettings.find()
        res.json(data)
    } catch (err) {
        res.json({ message: err })
    }
})

//CREATE A NEW SETTINGS
router.post('/', async (req, res) => {
    const setting = new SiteSettings({
        helloMessage: req.body.helloMessage,
        name: req.body.name,
        position: req.body.position,
        workTitle: req.body.workTitle,
        workDescription: req.body.workDescription,
        bioTitle: req.body.bioTitle,
    })
    try {
        const savedSetting = await setting.save()
        res.json(savedSetting)
        console.log('One more setting has been created!')
    } catch (err) {
        res.json({ message: err })
    }
})

module.exports = router

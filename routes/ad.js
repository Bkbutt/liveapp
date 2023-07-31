const express= require('express')
const router = express.Router()
const{createAd}= require('../controllers/adController')
const multer = require('multer')
const upload = multer({dest:'adsData/'})

router.post('/createAd',upload.single("adFile"),createAd)

module.exports= router
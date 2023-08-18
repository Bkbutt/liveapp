const express= require('express')
const router = express.Router()
const{createAd,getFilteredAds,getAdsMonth}= require('../controllers/adController')
const multer = require('multer')
const upload = multer({dest:'adsData/'})

router.post('/createAd',upload.single("adFile"),createAd)
router.post('/filterAds',getFilteredAds)
router.get('/getAdsMonth',getAdsMonth)
module.exports= router
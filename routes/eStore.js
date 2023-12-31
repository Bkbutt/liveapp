const express = require('express')
const router = express.Router()
const{buyEntrance,buyFrame,buyTextBubble,buyTheme,getstoreItemsMonth,coinsEarnedThroughStoreMonth}=require('../controllers/eStoreController')

router.post('/buyEntrance',buyEntrance)
router.post('/buyFrame',buyFrame)
router.post('/buyTextBubble',buyTextBubble)
router.post('/buyTheme',buyTheme)
router.get('/getstoreItemsMonth',getstoreItemsMonth)
router.get('/coinsEarnedThroughStoreMonth',coinsEarnedThroughStoreMonth)


module.exports= router
const express = require('express')
const router = express.Router()
const{buyEntrance,buyFrame,buyTextBubble,buyTheme}=require('../controllers/eStoreController')

router.post('/buyEntrance',buyEntrance)
router.post('/buyFrame',buyFrame)
router.post('/buyTextBubble',buyTextBubble)
router.post('/buyTheme',buyTheme)


module.exports= router
const express = require('express')
const router = express.Router()
const{createLevel,levelUp}=require('../controllers/levelController')

router.post('/upgradeLevel',levelUp)
router.post('/defineLevel',createLevel)


module.exports= router
const express = require('express')
const router = express.Router()
const{createLevel,levelUp,levelUpCountThisMonth,getRewardsGiveThisMonth}=require('../controllers/levelController')

router.post('/upgradeLevel',levelUp)
router.post('/defineLevel',createLevel)
router.get('/getRewardsGiveThisMonth',getRewardsGiveThisMonth)
router.get('/levelUpCountThisMonth',levelUpCountThisMonth
)


module.exports= router
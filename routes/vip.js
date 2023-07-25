const express=require('express')
const router = express.Router()
const {createVipUser,banUsers,vipIdentityChange}= require('../controllers/vipController')

router.post('/createVip',createVipUser)
router.post('/banUsers',banUsers)
router.post('/changeVipId',vipIdentityChange)
module.exports= router
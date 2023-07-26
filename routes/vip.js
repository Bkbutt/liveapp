const express=require('express')
const router = express.Router()
const {createVipUser,banUsers,vipIdentityChange,muteUser}= require('../controllers/vipController')

router.post('/createVip',createVipUser)
router.post('/banUsers',banUsers)
router.post('/changeVipId',vipIdentityChange)
router.post('/muteUser',muteUser)
module.exports= router
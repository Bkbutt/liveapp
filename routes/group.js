const express = require('express')
const router = express.Router()
const{createGroup,sendGrouopInvite,acceptGroupInvitation,
    approaveJoinRequest,leaveGroup,groupPost}=require('../controllers/groupController')

router.post('/createGroup',createGroup)
router.post('/sendGroupInvite',sendGrouopInvite)

router.post('/acceptGroupInvitation',acceptGroupInvitation)

router.post('/approaveJoinRequest',approaveJoinRequest)
router.post('/leaveGroup',leaveGroup)

router.post('/groupPost',groupPost)

module.exports= router
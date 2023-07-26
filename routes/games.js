const express=require('express')
const router = express.Router()
const {createGameModel,diamondPackage}= require('../controllers/gameController')
router.post('/createGameSetup',createGameModel)
router.post('/applyDiamondPackage',diamondPackage)

module.exports= router
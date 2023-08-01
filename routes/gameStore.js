const express = require('express')
const router = express.Router()
const{displayGames}=require('../controllers/gameStationController')

router.get('/gamesStation',displayGames)


module.exports= router
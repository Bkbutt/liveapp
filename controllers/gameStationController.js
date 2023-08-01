const Games = require('../models/sClubGameStationModel')

exports.displayGames = async(req,res)=>{
    try {
   const games  =await Games.find({})
   return res.status(200).json({success:true, games})
    } catch (error) {
        console.log(error.message)
        return res.status(400).json(error)
    }
}
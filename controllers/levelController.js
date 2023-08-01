const Levels = require('../models/sClubLevelModel')
const User = require('../models/userModel')
exports.createLevel= async(req,res)=>{
    try {
        const{levelNo,levelName,levelIcon,levelRequiredCoins,levelRewards}= req.body
        const level = new Levels({levelNo,levelName,levelIcon,levelRequiredCoins,levelRewards})
        await level.save()
        return res.json({success:true,level})
    } catch (error) {
        console.log(error.message)
        return res.status(400).json(error)    
    }
}

exports.levelUp = async(req,res)=>{
    try {
        const {userid}= req.body
        const  user = await User.findById(userid)
        const levelBefore = user.level//user.level 0
   const allLevels = await Levels.find({})

     allLevels.map((level)=>{
        // console.log(user.coins)
        // console.log(level.levelRequiredCoins)
         if( user.coins >= level.levelRequiredCoins )  {
            user.level=level.levelNo  
            user.levelName= level.levelName
            user.levelIcon=level.levelIcon
         }
     })

     if( user.level >levelBefore){
     return res.status(200).json({msg:`congrats! your level uped to ${user.level} from old level ${levelBefore}`})
     }
     return res.status(200).json({msg:`your level is ${levelBefore}, to jump to next level u need more coins`})
    } catch (error) {
        console.log(error.message)
        return res.status(400).json(error)  
    }
}
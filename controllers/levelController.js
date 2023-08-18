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
    let Rewards={}
     allLevels.map((level)=>{
        // console.log(user.coins)
        // console.log(level.levelRequiredCoins)
         if( user.coins >= level.levelRequiredCoins )  {
            user.level=level.levelNo  
            user.levelName= level.levelName
            user.levelIcon=level.levelIcon
            Rewards=level.levelRewards
         }
     })

     if( user.level >levelBefore){
       const days= Rewards.days//avalibity time for reward
         const rewardTrans={
           rewards:Rewards,
           timestamps:Date.now()
         }
         user.levelUpCount+=1
         user.rewards.push(rewardTrans)
         user.rewardsHistory.push(rewardTrans)
         await user.save()
        res.status(200).json({msg:`congrats! your level uped to ${user.level} from old level ${levelBefore},your rewards are ${Rewards}`})
        
        setTimeout(async()=>{
            const updatedUser = await UserModel.findById(userid);
            const transToBeDeleted= updatedUser.rewards.find((reward) => reward === rewardTrans);
            if (transToBeDeleted) {
                const index = updatedUser.rewards.indexOf(transToBeDeleted);
                updatedUser.rewards.splice(index, 1);
                await updatedUser.save();
                console.log('Rewards avail time completed');
              }
        },days*24*60*60*1000)
     }
     return res.status(200).json({msg:`your level is ${levelBefore}, to jump to next level u need more coins`})
    } catch (error) {
        console.log(error.message)
        return res.status(400).json(error)  
    }
}


exports.getRewardsGiveThisMonth=async(req,res)=>{
    try {
        const users = await User.find({});
    
        const currentMonth=new Date().getMonth()
        const currentYear=new Date().getFullYear()
        const monthUsers = users.filter((user) => {
          const userDate = new Date(user.time);
          return (
            userDate.getMonth() === currentMonth && // Month is 0-indexed
            userDate.getFullYear() === currentYear
          );
        });
        let monthRewardCount=0

        monthUsers.map((user)=>{
         monthRewardCount+=user.rewardsHistory.length
         })
        return res.json(`total rewards given to users this month ${monthRewardCount}`)
    } catch (error) {
        console.log(error.message)
        return res.status(400).json(error)   
    }
}


exports.levelUpCountThisMonth= async(req,res)=>{
    try {
        const users = await User.find({});
    
        const currentMonth=new Date().getMonth()
        const currentYear=new Date().getFullYear()
        const monthUsers = users.filter((user) => {
          const userDate = new Date(user.time);
          return (
            userDate.getMonth() === currentMonth && // Month is 0-indexed
            userDate.getFullYear() === currentYear
          );
        });

        let monthCount =0
        monthUsers.map((user)=>{
            monthCount+=user.levelUpCount
        })

        return res.status(200).json({msg:`total levelUps this month : ${monthCount}`})
    } catch (error) {
        console.log(error.message)
        return res.status(400).json(error)   
    }
}
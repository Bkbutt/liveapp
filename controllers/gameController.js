const express = require('express')

const User = require('../models/userModel')
const VIP= require('../models/vipModel')
const Game= require('../models/gameModel')

exports.createGameModel= async(req,res)=>{
    try {
        const{gameName,betSetup,commotion,bigBet,winLimitationMin,winLimitationMax,diamonds,userid}=req.body
         
        const user = await User.findById(userid)
        if(!user) {return res.status(400).json({message:"no such singleClub user"})}
        const gameUserAlready = await Game.find({userid:userid})
        if(gameUserAlready){return res.status(400).json({message:"game User already exists"})}
         
        const userGameSetup=new Game({gameName,betSetup,commotion,bigBet,winLimitationMin,winLimitationMax,diamonds,userid:userid})
        await userGameSetup.save()
        return res.status(200).json({message:"user game Setup created successfully"})

    } catch (error) {
        console.log(error)
        res.status(400).json(error)     
    }
}

exports.diamondPackage = async(req,res)=>{
    try {
          const{userid, diamondsInvested}=req.body
          const user= await User.findById(userid)
          console.log(user)
        if(!user){return res.status(400).json({message:"no such singleClub user"})}
        //retrive the user's game detail document using ref userid field
          const usergameDetail = await Game.findOne({userid:userid})
          console.log(usergameDetail)
          //check if user has enough diamonds
        if(usergameDetail.diamonds < diamondsInvested){
            return res.json({message:"you dont have enough diamonds to invest" })
           }
        //deduct invested diamonds from user"s diamonds ,save user  
        usergameDetail.diamonds-= diamondsInvested   
        await usergameDetail.save()

        let diamondsToBeRewardedEachDay =  0
        let diamondsToReturn=0
        let count=0// iterator to count 30 days
           const VIP = user.isVIP
           console.log(VIP)
           if(!VIP) {
               //user not vip,return 25% diamonds back to norml user
               diamondsToReturn = 0.25 * diamondsInvested
               diamondsToBeRewardedEachDay=diamondsToReturn/30
    
              // func to give diamond everday for 30 days
              let giveDiamondsToday = setInterval(async function(){
                // increasing the count by 1
                count += 1;
               // when count equals to 30, stop the function
                if(count === 30){
                    clearInterval(giveDiamondsToday);
                }
                //giving coin for each day
                usergameDetail.diamonds += diamondsToBeRewardedEachDay;
                 await usergameDetail.save();
                console.log(`Diamonds given to user for day ${count}`);
            }, 24 * 60 * 60 * 1000);
          
           console.log('amount deducted from normal user')
        return res.status(200).json({message:`you daily diamound amount is here!!`,diamondsToBeRewardedEachDay,usergameDetail})
         }     
        else{
         //vip user,return 50% back to vip user
         diamondsToReturn = 0.25 * diamondsInvested
         diamondsToBeRewardedEachDay= diamondsToReturn/30
            // func to give diamond everday for 30 days
            let giveDiamondsToday = setInterval(async function(){
                // increasing the count by 1
                count += 1;
               // when count equals to 30, stop the function
                if(count === 30){
                    clearInterval(giveDiamondsToday);
                }
                //giving coin for each day
                usergameDetail.diamonds += diamondsToBeRewardedEachDay;
                 await usergameDetail.save();
                 console.log(`Diamonds given to user for day ${count}`);
            }, 24 * 60 * 60 * 1000);
    
          return res.status(200).json({message:`you daily diamound amount is here!`,diamondsToBeRewardedEachDay,usergameDetail})
        }

    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}
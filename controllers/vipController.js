const express = require('express')

const User = require('../models/userModel')
const VIP= require('../models/vipModel')

exports.createVipUser =async(req,res)=>{

try {
    const{userid,vipCategory,vipLevel,name,vipId,vipForDays,priceCoins,oppertunityPowers }= req.body
    if(!userid || !vipCategory || !vipLevel || !name || !vipId || !vipForDays || !priceCoins || !oppertunityPowers){
     return res.status(400).json({message:"Please give all info about being a VIP"})
    } 
     const user= await  User.findOne({_id:userid})
     if(!user){
        return res.status(400).json({message:"no such user in single club"})
     }

      const alreadyVip =  await VIP.findOne({vipId:vipId})
      if(alreadyVip){
        return res.status(400).json({message:"Sorry! Vip user with this id already exists"})
      }
     user.isVIP= true
     await user.save()
    console.log('user saved',user)
    const vipUser = new VIP({vipCategory,vipLevel,name,vipId,vipForDays,priceCoins,oppertunityPowers,userid:userid})
    await vipUser.save();
    res.status(200).json({message:"you make this user a VIP user",vipUser})
     
} catch (error) {
    console.log(error)
    res.status(400).json({error})   
}
}

exports.banUsers=async(req,res)=>{
try {
    const{userid}=req.body
    const user= await User.findById(userid)
    if(!user){
        return res.status(400).json({message:"no such user exists in single club"})
    }
if(!user.isVIP === "true"){
//user not vip
 res.status(200).json({message:"user is banned successfully as is not vip"})
}
// executes if user is vip
console.log('user is  vip')
res.status(200).json({message:"Vip user cannot be banned"})

} catch (error) {
    res.status(400).json(error)
}

}

exports.vipIdentityChange= async(req,res)=>{
    try {
        const{userid, anonymousId}=req.body
        if(!userid || !anonymousId){
            return res.send('enter your new vipId and singleClub userid')
        }
        const user= await User.findById(userid)
        const validId= anonymousId.toString().length === 7
        // console.log('valid?',validId)
        if(!validId ||  !user){
            return res.send('oOps! New vipId can have only 7 digits OR no such user exists in single club')
        }
        
        if(!user.isVIP === "true"){
           //user not vip
            res.status(200).json({message:"normal user hasnt  this feature of changing identity"})
           }
           
     // control comes here if user is vip AND CAN change vipid 
         console.log('user is  vip')
         //check if has power == changeid 
         const vipUser =await VIP.findOne({userid:userid})//retrive the details of vip user
         console.log(vipUser)
         if(vipUser.oppertunityPowers == "changeID"){
        const alreadyVip =  await VIP.findOne({vipId:anonymousId})//if this id already exists
          if(alreadyVip){
          return res.status(400).json({message:"Sorry! Vip user with this id already exists"})
        }
         vipUser.vipId= anonymousId
         await vipUser.save()
          return res.status(200).json({message:"updated vipId successfully,!your new unique vipId is",newVip:vipUser.vipId})
        }
        //comes here if changeid power not matched
        return res.status(400).json({message:"Sorry! changeID power was not matched"})
    } catch (error) {
        res.status(400).json(error)
    }
    
}
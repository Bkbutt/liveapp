const eStore = require('../models/sClubEStoreModel')
const User = require('../models/userModel')

exports.buyEntrance = async(req,res)=>{
    try {
        const {userId,entranceId}= req.body
        const user = await User.findById(userId)
        const store = await eStore.findById(entranceId)
        if(user.coins < store.entrancePriceCoins){ //if user eligible to buy or not
           return res.json({msg:"you dont have enough coins yet to shop this"})
        }
        user.coins-= store.entrancePriceCoins//deduct item fee
        let days= store.entranceGivenForDays
        const availHours = days*24// store total avail time in hours
        //storing buy info 
        const storeTrans= {
        itemPurchased:store.entranceName,
        atPrice:store.entrancePriceCoins,
        AvailDays:store.entranceGivenForDays,
        purchasedAt:Date.now()
        }
        
        user.myStore.push(storeTrans)
        await user.save()
        res.status(200).send('you shopped this item')
        //after vallid avail time.deltete this item from users mystore
        setTimeout(async()=>{
            const updatedUser = await UserModel.findById(userId);
            const transToBeDeleted= updatedUser.myStore.find((trans) => trans === storeTrans);
            if (transToBeDeleted) {
                const index = updatedUser.myStore.indexOf(transToBeDeleted);
                updatedUser.myStore.splice(index, 1);
                await updatedUser.save();
                console.log('entrance avail time completed');
              }
        },availHours*60*60*1000)
    } catch (error) {
        console.log(error.message)
        return res.status(400).json(error)     
    }
}
exports.buyFrame = async(req,res)=>{
    try {
        const {userid,frameId}= req.body
        const user = await User.findById(userid)
        const store = await eStore.findById(frameId)
        if(user.coins < store.framePriceCoins){
           return res.json({msg:"you dont have enough coins yet to shop this"})
        }
        user.coins-= store.framePriceCoins  
        let days= store.frameGivenForDays
        const availHours = days*24
        const storeTrans= {
        itemPurchased:store.frameName,
        atPrice:store.framePriceCoins,
        AvailDays:store.frameGivenForDays,
        purchasedAt:Date.now()
        }
        
        user.myStore.push(storeTrans)
        await user.save()
        res.status(200).send('you shopped this item')
        setTimeout(async()=>{
            const updatedUser = await UserModel.findById(userid);
            const transToBeDeleted= updatedUser.myStore.find((trans) => trans === storeTrans);
            if (transToBeDeleted) {
                const index = updatedUser.myStore.indexOf(transToBeDeleted);
                updatedUser.myStore.splice(index, 1);
                await updatedUser.save();
                console.log('frame avail time completed');
              }
        },availHours*60*60*1000)
    } catch (error) {
        console.log(error.message)
        return res.status(400).json(error)     
    }
}
exports.buyTextBubble= async(req,res)=>{
    try {
        const {userid,textBubbleId}= req.body
        const user = await User.findById(userid)
        const store = await eStore.findById(textBubbleId)
        if(user.coins < store.textBubblePriceCoins){
           return res.json({msg:"you dont have enough coins yet to shop this"})
        }
        user.coins-= store.textBubblePriceCoins
        let days= store.textBubbleGivenForDays
        const availHours = days*24
        const storeTrans= {
        itemPurchased:store.textBubbleName,
        atPrice:store.textBubblePriceCoins,
        AvailDays:store.textBubbleGivenForDays,
        purchasedAt:Date.now()
        }
        
        user.myStore.push(storeTrans)
        await user.save()
        res.status(200).send('you shopped this item')
        setTimeout(async()=>{
            const updatedUser = await UserModel.findById(userid);
            const transToBeDeleted= updatedUser.myStore.find((trans) => trans === storeTrans);
            if (transToBeDeleted) {
                const index = updatedUser.myStore.indexOf(transToBeDeleted);
                updatedUser.myStore.splice(index, 1);
                await updatedUser.save();
                console.log('textBubble avail time completed');
              }
        },availHours*60*60*1000)
      
    } catch (error) {
        console.log(error.message)
        return res.status(400).json(error)     
    }
}

exports.buyTheme = async(req,res)=>{
    try {
        const {userid,themeId}= req.body
        const user = await User.findById(userid)
        const store = await eStore.findById(themeId)
        if(user.coins < store.themePriceCoins){
           return res.json({msg:"you dont have enough coins yet to shop this"})
        }
        user.coins-= store.themePriceCoins
        let days= store.themeGivenForDays
        const availHours = days*24
        const storeTrans= {
        itemPurchased:store.themeName,
        atPrice:store.themePriceCoins,
        AvailDays:store.themeGivenForDays,
        purchasedAt:Date.now()
        }
        
        user.myStore.push(storeTrans)
        await user.save()
        res.status(200).send('you shopped this item')
        setTimeout(async()=>{
            const updatedUser = await UserModel.findById(userId);
            const transToBeDeleted= updatedUser.myStore.find((trans) => trans === storeTrans);
            if (transToBeDeleted) {
                const index = updatedUser.myStore.indexOf(transToBeDeleted);
                updatedUser.myStore.splice(index, 1);
                await updatedUser.save();
                console.log('theme avail time completed');
              }
        },availHours*60*60*1000)
    } catch (error) {
        console.log(error.message)
        return res.status(400).json(error)     
    }}
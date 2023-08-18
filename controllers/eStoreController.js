const eStore = require('../models/sClubEStoreModel')
const User = require('../models/userModel')

exports.buyEntrance = async(req,res)=>{
    try {
        const {userId,entranceId,adminId}= req.body
        const user = await User.findById(userId)
        const admin = await User.findById(adminId)
        const store = await eStore.findById(entranceId)
        if(user.coins < store.entrancePriceCoins){ //if user eligible to buy or not
           return res.json({msg:"you dont have enough coins yet to shop this"})
        }
        let days= store.entranceGivenForDays
        const availHours = days*24// store total avail time in hours
        user.coins-= store.entrancePriceCoins//deduct item fee
        //storing buy info 
        const storeTrans= {
        itemPurchased:store.entranceName,
        atPrice:store.entrancePriceCoins,
        AvailDays:store.entranceGivenForDays,
        purchasedAt:Date.now()
        }
        
        user.myStore.push(storeTrans)
        user.storeHistory.push(storeTrans)
        await user.save()//save user with trans 

        admin.coins+=store.entrancePriceCoins
        const astoreTrans= {
            itemPurchased:store.entranceName,
            collectedCoins:store.entrancePriceCoins,
            AvailDays:store.entranceGivenForDays,
            purchasedAt:Date.now()
            }
        admin.myStore.push(astoreTrans) 
        admin.save() //save trans and admin coins
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
        const {userid,frameId,adminId}= req.body
        const user = await User.findById(userid)
        const admin = await User.findById(adminId)
        const store = await eStore.findById(frameId)
        if(user.coins < store.framePriceCoins){
           return res.json({msg:"you dont have enough coins yet to shop this"})
        }
        let days= store.frameGivenForDays
        const availHours = days*24
        user.coins-= store.framePriceCoins  
        const storeTrans= {
        itemPurchased:store.frameName,
        atPrice:store.framePriceCoins,
        AvailDays:store.frameGivenForDays,
        purchasedAt:Date.now()
        }
        
        user.myStore.push(storeTrans)
        user.storeHistory.push(storeTrans)
        await user.save()
       
        admin.coins+=store.framePriceCoins
        const astoreTrans= {
            itemPurchased:store.frameName,
            collectedCoins:store.framePriceCoins,
            AvailDays:store.frameGivenForDays,
            purchasedAt:Date.now()
        }
        admin.myStore.push(astoreTrans) 
        await admin.save()

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
        const {userid,textBubbleId,adminId}= req.body
        const user = await User.findById(userid)
        const admin = await User.findById(adminId)
        const store = await eStore.findById(textBubbleId)
        if(user.coins < store.textBubblePriceCoins){
           return res.json({msg:"you dont have enough coins yet to shop this"})
        }
        let days= store.textBubbleGivenForDays
        const availHours = days*24

        user.coins-= store.textBubblePriceCoins
        const storeTrans= {
        itemPurchased:store.textBubbleName,
        atPrice:store.textBubblePriceCoins,
        AvailDays:store.textBubbleGivenForDays,
        purchasedAt:Date.now()
        }
        
        user.myStore.push(storeTrans)
        user.storeHistory.push(storeTrans)
        await user.save()

        admin.coins+=store.textBubblePriceCoins
        const astoreTrans= {
            itemPurchased:store.textBubbleName,
            collectedCoins:store.textBubblePriceCoins,
            AvailDays:store.textBubbleGivenForDays,
            purchasedAt:Date.now()
        }
        admin.myStore.push(astoreTrans) 
         await admin.save()
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
        const {userid,themeId,adminId}= req.body
        const user = await User.findById(userid)
        const admin = await User.findById(adminId)
        const store = await eStore.findById(themeId)
        if(user.coins < store.themePriceCoins){
           return res.json({msg:"you dont have enough coins yet to shop this"})
        }
        let days= store.themeGivenForDays
        const availHours = days*24
        user.coins-= store.themePriceCoins
        const storeTrans= {
        itemPurchased:store.themeName,
        atPrice:store.themePriceCoins,
        AvailDays:store.themeGivenForDays,
        purchasedAt:Date.now()
        }
        
        user.myStore.push(storeTrans)
        user.storeHistory.push(storeTrans)
        await user.save()

        admin.coins+= store.themePriceCoins
        const astoreTrans= {
            itemPurchased:store.themeName,
            collectedCoins:store.themePriceCoins,
            AvailDays:store.themeGivenForDays,
            purchasedAt:Date.now()
        }
         admin.myStore.push(astoreTrans) 
         await admin.save()

        res.status(200).send('you shopped this item')
        setTimeout(async()=>{
            const updatedUser = await UserModel.findById(userid);
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


    exports.getstoreItemsMonth = async (req, res) => {
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
          });//retrive docs of this month
      
          let storecount = 0
          //count all items from each user and store in storecount
          monthUsers.map((user)=>{
             storecount+=user.myStore.length
          })
        res.json({msg:`NO of items purchased this month: ${storecount}`});
        } catch (error) {
          console.log(error.message);
          return res.status(400).json({ MSG: "Error" });
        }
      };
      

      exports.coinsEarnedThroughStoreMonth= async(req,res)=>{
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
            });//retrive docs of this month 

            let monthCoins=0

          monthUsers.map((user)=>{
          
            user.storeHistory.map((itemPurchased)=>{
             monthCoins+=itemPurchased.atPrice
            })
          })

          res.json({msg:`coins earned from store this month: ${monthCoins}`});

        } catch (error) {
            console.log(error.message);
            return res.status(400).json({ MSG: "Error" });
        }
      }
      
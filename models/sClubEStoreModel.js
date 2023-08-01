const mongoose= require('mongoose')
const eStoreSchema= mongoose.Schema({

  entranceName :{type:String},
  entranceIcon:{type:String},
  entrancePriceCoins:{type:Number},
  entranceGivenForDays:{type:Number},
  //frames 
  frameName :{type:String},
  frameIcon:{type:String},
  framePriceCoins:{type:Number},
  frameGivenForDays:{type:Number},
//structure for buble txt
textBubbleName :{type:String},
textBubbleIcon:{type:String},
textBubblePriceCoins:{type:Number},
textBubbleGivenForDays:{type:Number},
//themes
themeName :{type:String},
themeIcon:{type:String},
themePriceCoins:{type:Number},
themeGivenForDays:{type:Number},
})
module.exports= mongoose.model('eStore',eStoreSchema) 
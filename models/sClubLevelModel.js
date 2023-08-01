const mongoose= require('mongoose')
const levelSchema= mongoose.Schema({
levelNo:{type:Number},
levelName:{type:String},
levelIcon:{type:String},
levelRequiredCoins:{type:Number},
levelRewards:{type:Object}   

})

module.exports=mongoose.model('Level',levelSchema)
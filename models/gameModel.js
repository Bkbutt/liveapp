const mongoose= require("mongoose"
)
const gameModel = mongoose.Schema({

    gameName:{type:String, enum:['Teen Patti','Jetport Fruit','Lucky 7']},
    betSetup: {
        coinCollectTime: {
          type: Date,
          },
        remindTime: {
          type: Date,
         },
        destitutionTime: {
          type: Date,
         },
        resultTime: {
            type: Date,
           },
         totalTime: {
            type: Date,
           }
       },

    commotion:{minPercent:{type:String},maxPercent:{type:String}},

    bigBet:{min:{type:Number},max:{type:Number}},

    winLimitationMin:{ 
        setAmount:{type:Number},restrictionHrs:{type:Date},
        restrictionDays:{type:Number},selectIcon:{type:String},expireIcon:{type:Date}
      },
    
    winLimitationMax:{ 
        setAmount:{type:Number},restrictionHrs:{type:Date},
        restrictionDays:{type:Number},selectIcon:{type:String},expireIcon:{type:Date}
      },
    diamonds:{type:Number,default:0},
    userid: {type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
})
module.exports=mongoose.model('Game',gameModel)
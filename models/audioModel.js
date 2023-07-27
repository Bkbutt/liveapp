const mongoose= require('mongoose')

const audioModel =mongoose.Schema({

    isMute :{type:Boolean,default:false},
    isBan:{type:Boolean,default:false},
    userid:{type:mongoose.Schema.Types.ObjectId, ref:"User"}
})
module.exports= mongoose.model("Audio",audioModel)


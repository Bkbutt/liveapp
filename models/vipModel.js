const mongoose = require('mongoose')


const vipModel = mongoose.Schema({

vipCategory:{type:String ,enum:["VIP","sVIP"]},
vipLevel:{type:Number,enum:[1,2,3,4,5]},
vipId: {type:Number,unique:true,required:true,  
    validate: {
    validator: function(val) {
        return val.toString().length === 7
    },
    message: val => `vipId can only has 7 digits.${val.value} dont have 7 digits.`
}},
name:{type:String},
vipForDays:{type:Number},
priceCoins:{type:Number},
userid: { type:mongoose.Schema.Types.ObjectId, ref: "User" },
oppertunityPowers:{type:String,enum:["neverBan","neverMute","vipGift","vipMedal","changeID"] }

})


module.exports = mongoose.model('VIP',vipModel)
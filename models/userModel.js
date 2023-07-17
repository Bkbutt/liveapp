const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
 
name:{type:String},
email:{type:String,required:true},
password:{type:String},
phoneNo:{type:Number},
gender:{type:String},
country:{type:String},
relationship:{type:String},
googleId:{type:String},
googlePass:{type:String},
facebookId:{type:String},
facebookPass:{type:String},
twitterId:{type:String},
twitterPass:{type:String},
profilePic:{type:String},
coverPhoto:{type:String},
userLevel:{type:String},
isVIP:{type:Boolean},
userStore:{type:Array}
})
module.exports= mongoose.model('User',userSchema)
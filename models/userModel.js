const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
// _id:{type:String},
name:{type:String},
email:{type:String,required:true},
password:{type:String},
phoneNo:{type:Number},
transactions:{type:Array},
teenPattiTrans: {type:Array},
blockExpiresAt:{type:String},
level:{type:Number},
levelName:{type:String},
levelIcon:{type:String},
coins:{type:Number},
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
likes:{type:Array},
lives:{type:Array}
})
module.exports= mongoose.model('User',userSchema)
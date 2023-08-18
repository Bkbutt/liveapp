const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
// _id:{type:String},
name:{type:String},
email:{type:String,required:true},
password:{type:String},
phoneNo:{type:Number},
rewards:{type:Array},
rewardsHistory:{type:Array},
transactions:{type:Array},
teenPattiTrans: {type:Array},
blockExpiresAt:{type:String},
role:{type:String,enum:['user','admin','host'],default:"user"}, 
interest:{type:String,enum:['Beauty','Entertainment','Sports','Adventure','Education','Fashion','Politics','Love']},
level:{type:Number,default:0},
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
coverPic:{type:String},
coverPhoto:{type:String},
userLevel:{type:String},
isOnline:{type:Boolean,default:false},
isBan:{type:Boolean,default:false},
isMute:{type:Boolean,default:false},
isVIP:{type:Boolean},
likes:{type:Array},
verifyCount:{type:Number,default:0},
levelUpCount:{type:Number,default:0},
mediaCount:{type:Number,default:0},
lives:{type:Array},
blocked:{type:Array},
myStore:{type:Array},
storeHistory:{type:Array},
friends:{type:Array},
friendRequests:{type:Array},
time: { type: String, default: null } 
})
//domne  
userSchema.pre('save', function(next) {
    if (this.isNew) {
      this.time = new Date().toString();
    }
    next();
  });
module.exports= mongoose.model('User',userSchema)
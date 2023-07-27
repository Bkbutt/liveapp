const mongoose=require('mongoose')
const postModel =mongoose.Schema({

 userid: { type: mongoose.Schema.Types.ObjectId,ref: 'User'},
 postType:{type:String,enum:['text','picture','audio','video']},
 content:{type:String},
 postFile:{type:String},
 stickers:{type:[{type:String}]},
 tags:{type: [  { type: mongoose.Schema.Types.ObjectId,ref: 'User'}]},
 likes:{type: Array},
 comments:{type:Array},
 copyLink:{type:String},
 noOfShares:{type: [  { type: mongoose.Schema.Types.ObjectId,ref: 'User'}]},
 noOfReports:{type: [  { type: mongoose.Schema.Types.ObjectId,ref: 'User'}]},
 location:{type:String,  immutable: false},
 postUploadTime:{type:Date,default:new Date()},
 downloadPost:{type:String}
 
},  {
    timestamps: true,
})
module.exports= mongoose.model('Post',postModel)
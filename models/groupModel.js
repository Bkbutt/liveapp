const mongoose= require('mongoose')
const groupModel = mongoose.Schema({

 name:{type:String},
 mainPhoto:{type:String},
 coverPhoto:{type:String},
 about:{type:String},
 Admins: { type:Array},
  members: {type:Array },//join members,
  posts:{type:Array},
  userid: { type: mongoose.Schema.Types.ObjectId,ref: 'User'},//member which threw this post
  postType:{type:String,enum:['text','picture','audio','video']},
  content:{type:String},
  postFile:{type:String},
  stickers:{type:[{type:String}]},
  tags:{type: [  { type: mongoose.Schema.Types.ObjectId,ref: 'User'}]},
  likes:{type: Array},
  groupId: { type: mongoose.Schema.Types.ObjectId,ref: 'Group'},
  comments:{type:Array},
  location:{type:String,  immutable: false},
 dateCreated:{type:String,default:new Date()},
 time:{type:String},


})

module.exports= mongoose.model("Group",groupModel)
const mongoose= require('mongoose')
const videoModel = mongoose.Schema({

 topic:{type:String},
 hostId: { type: Schema.Types.ObjectId, ref: 'User' },//live host
 speakers: {type: [  { type: mongoose.Schema.Types.ObjectId,ref: 'User'}], required: false, },//join members,
 muteSpeakers :{type:[{type: mongoose.Schema.Types.ObjectId,ref: 'User'}]},
 banSpeakers:{type:[{type: mongoose.Schema.Types.ObjectId,ref: 'User'}]},
 kickedOuts:{type:[{type: mongoose.Schema.Types.ObjectId,ref: 'User'}]},
 date:{type:String},
 time:{type:String},
 screenSharing:{type:String},
 chatInbox:{type:String},
 shareLink:{type:String}


})

module.exports= mongoose.model("Video",videoModel)
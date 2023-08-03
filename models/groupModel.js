const mongoose= require('mongoose')
const groupModel = mongoose.Schema({

 name:{type:String},
 mainPhoto:{type:String},
 coverPhoto:{type:String},
 about:{type:String},
 Admins: { type:Array},
  members: {type:Array },//join members,
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post', // Reference to the Post schema
    },
  ],
 dateCreated:{type:String},
 time:{type:String},


})

module.exports= mongoose.model("Group",groupModel)
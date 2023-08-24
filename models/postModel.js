const mongoose=require('mongoose')
const postModel =mongoose.Schema({

 userid: { type: mongoose.Schema.Types.ObjectId,ref: 'User'},
 postType:{type:String,enum:['text','picture','audio','video']},
 content:{type:String},
 postFile:{type:String},
 stickers:{type:[{type:String}]},
 category:{type:String,enum:['Beauty','Entertainment','Sports','Adventure','Education','Fashion','Politics','Love']},
 tags:{type: [  { type: mongoose.Schema.Types.ObjectId,ref: 'User'}]},
 likes:{type: Array},
 comments:{type:Array},
 copyLink:{type:String},
 noOfShares:{type: [  { type: mongoose.Schema.Types.ObjectId,ref: 'User'}]},
 noOfReports:{type: [  { type: mongoose.Schema.Types.ObjectId,ref: 'User'}]},
 location:{type:String,  immutable: false},
 downloadPost:{type:String},
 time:{type: String, default: null}
 
},  {
    timestamps: true,
})
postModel.pre('save', function(next) {
    if (this.isNew) {
      this.time = new Date().toString();
    }
    next();
  });
module.exports= mongoose.model('Post',postModel)
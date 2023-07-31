const mongoose = require('mongoose')

const adSchema = mongoose.Schema({

adTitle:{type:String},
city:{type:String},
ageGroup:{type:String},
adType:{type:String,enum:['text','picture','audio','video']},
content:{type:String},
adFile:{type:String},
likes:{type: Array},
comments:{type:Array},

})
mongoose.model('Ad',adSchema)
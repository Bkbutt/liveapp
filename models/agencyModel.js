const mongoose= require(
    'mongoose'
)

const agencyModel = mongoose.Schema({
    agencyName:{type:String},
    address:{type:String},
    category:[{type:String}],
    aim:{type:String},
    time:{type:String,default:null}

})
agencyModel.pre('save', function(next) {
    if (this.isNew) {
      this.time = new Date().toString();
    }
    next();
  });

module.exports=mongoose.model('Agency',agencyModel)
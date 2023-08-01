const mongoose= require('mongoose')
const gameStoreSchema = mongoose.Schema({
gameName:{type:String},
gamePoster:{type:String}

})
module.exports= mongoose.model('gameStore',gameStoreSchema)
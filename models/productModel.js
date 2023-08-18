const mongoose= require('mongoose')

const productSchema  =mongoose.Schema({

    id:{type:Number},
    brand:{type:String},
    name:{type:String},
    price:{type:Number},
    price_sign:{type:String},
    currency:{type:String},
    image_link:{type:String},
    product_link:{type:String},
   website_link:{type:String},
   description:{type:String},
   rating:{type:String},
   category:{type:String},
  product_type:{type:String},
   tag_list:[{type:String}],
  created_at:{type:Date},
  updated_at:{type:Date},
  product_api_url:{type:String},
  api_featured_image:{type:String},
     product_colors:[{type:Object}]

})
module.exports= mongoose.model("Product",productSchema)
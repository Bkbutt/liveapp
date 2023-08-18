const Product = require("../models/productModel");

exports.createProduct = async (req, res) => {
    try{

        let data=[]
        const dataArray = req.body;
        for (const dataObj of dataArray) {
          const newData = new Product(dataObj);
          await newData.save();
          data.push(newData)
        }
  res.status(200).json({success:true, data})

}catch(error){
    return res.json(error,{error:error.message})
  }

}

exports.createProduct2 = async (req, res) => {
    try{

        let data=[]
        const dataArray = req.body;
        for (const dataObj of dataArray) {
          const newData = new Product(dataObj);
          await newData.save();
          data.push(newData)
        }
  res.status(200).json({success:true, data})

}catch(error){
    return res.json(error,{error:error.message})
  }

}


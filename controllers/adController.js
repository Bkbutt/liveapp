const Ad = require('../models/adModel')

exports.createAd= async(req,res)=>{
try {
     const{adTitle,city , ageGroup,adType,content,likes,comments}=req.body   
     const adFile = req.file.path;

     const ad = new Ad({adTitle,city,adFile,ageGroup,adType,content,likes,comments})
     await ad.save()
     return res.status(200).json({success:true,ad:ad})
    } catch (error) {
        console.log(error.message)
        return res.status(400).json({error}) 
    }
}
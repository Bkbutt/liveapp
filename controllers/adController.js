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


exports.getFilteredAds = async (req, res) => {
    try {
      const { age, city, interest } = req.query;
  
      // Construct a query object based on the provided parameters
      const query = {
        interestedAgeGroups: age,
        interestedCities: city,
        adType: interest, // Assuming adType corresponds to user interests
      };
  
      // Remove empty fields from the query object
      Object.keys(query).forEach((key) => query[key] === undefined && delete query[key]);
  
      // Fetch the ads based on the filtered query
      const ads = await Ad.find(query);
  
      return res.status(200).json({ success: true, ads });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ error });
    }
  };
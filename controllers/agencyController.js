const Agency =require('../models/agencyModel')

exports.createAgency= async(req,res)=>{
    try {
         const{agencyName,address,category,aim}=req.body   
    
         const agency = new Agency({agencyName,address,category,aim})
         await agency.save()
         return res.status(200).json({success:true,agency})
        } catch (error) {
            console.log(error.message)
            return res.status(400).json({error}) 
        }
    }

exports.editAgency=async(req,res)=>{
 try {
    let update=req.body
    const  updated  = await Agency.findByIdAndUpdate(req.params.id,update,{new:true});
    await updated.save()
    res.json({success:true,updated})
 } catch (error) {
    console.log(error.message)
    return res.status(400).json({error}) 
 }
}





    exports.getAgenciesThisMonth=async(req,res)=>{
        try {
                      
    const agencies = await Agency.find({});
    
    const currentMonth=new Date().getMonth()
    const currentYear=new Date().getFullYear()
    const monthAgencies = agencies.filter((agency) => {
      const userDate = new Date(agency.time);
      return (
        userDate.getMonth() === currentMonth && // Month is 0-indexed
        userDate.getFullYear() === currentYear
      );
    });
    return res.json({msg:`users this month: ${monthAgencies.length}`});

        } catch (error) {
            console.log(error.message)
            return res.status(400).json({error})    
        }
    }
const express= require(
    'express'
)
const router= express.Router()
const{getAgenciesThisMonth,createAgency,editAgency}=require('../controllers/agencyController')
router.post('/createAgency',createAgency)
router.post('/editAgency/:id',editAgency)
router.get('/getAgenciesThisMonth',getAgenciesThisMonth)
module.exports=router
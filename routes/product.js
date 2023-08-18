const express = require('express')
const router =express.Router()
const multer = require('multer')

const{createProduct,createProduct2}= require('../controllers/productController')

router.post("/createProduct",createProduct)
router.post("/createProduct2",createProduct2)

module.exports = router
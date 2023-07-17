const express=require('express')
const router = express.Router()
const passport= require('passport')
const{Signup,login,verifyOtp,loginWithGoogle,getUser,updateuser,deleteuser}= require('../controllers/userController')

router.post('/signup',Signup)
router.post('/verifyotp',verifyOtp)
router.post('/login',login)
router.post('/loginwithgoogle',loginWithGoogle)
// Google authentication route
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

// Google authentication callback route
router.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/profile',
  failureRedirect: '/login',
}))
router.get('/user/:id',getUser)
router.post('/updateUser',updateuser)
router.delete('/deleteuser/:id',deleteuser)

module.exports= router
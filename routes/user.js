const express=require('express')
const router = express.Router()
const passport= require('passport')
const multer = require('multer');

const{Signup,login,verifyOtp,loginWithGoogle,loginWithFacebook,
  loginWithTwitter,getUser,updateuser,deleteuser,maxLiked,likeUser,levelUp,liveSession,luxuryGift,
  luckyGift,handleSuperJackpot,handleSingleSend,handleComboSend,fruitCoinGame,getUserGameHistory,teenPatti,
  coinsCollectedThroughFruitGame,wonAtSeats,SENDchangePhoneNumberOTP,verifyChangePhoneNo
,changePassword,blockAUser,unblock,getMyBlockedList}= require('../controllers/userController')
  
  const storage = multer.diskStorage({
     destination: (req, file, cb) => {
       cb(null, 'userFiles/');
     },
     filename: (req, file, cb) => {
       cb(null, file.originalname);
     }
   });
   
   const userFile = multer({ storage });

router.post('/signup',userFile.array('files',2),Signup)
router.post('/verifyOpt',verifyOtp)
router.post('/login',login)

router.post('/loginwithgoogle',loginWithGoogle)
// Google authentication routexc
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

// Google authentication callback route
router.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/profile',
  failureRedirect: '/login',
}))

router.post('/loginwithfacebook',loginWithFacebook)
// Facebook authentication route
router.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook authentication callback route
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/profile',
  failureRedirect: '/login',
}));

router.post('/loginwithtwitter',loginWithTwitter)
// twitter authentication and callback route
router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/profile',
  failureRedirect: '/login',
}));

router.get('/user/:id',getUser)
router.post('/updateUser',updateuser)
router.delete('/deleteuser/:id',deleteuser)
router.post('/:userId/likeUser',likeUser)
// router.get('/likeuser/:userid/:fanid',likeUser)
router.get('/getmaxlikes',maxLiked)
router.post('/levelcheck',levelUp)
router.post('/liveSession',liveSession)
router.post('/luxuryGift',luxuryGift)
router.post('/luckyGift',luckyGift)
router.post('/superjackpot',handleSuperJackpot)
router.post('/singleSend',handleSingleSend)
router.post('/comboSend',handleComboSend)
router.post('/fruitCoinGame',fruitCoinGame)
router.post('/getUserGameHistory',getUserGameHistory)
router.post('/teenpatti',teenPatti)
router.post('/userFruitGameCoins',coinsCollectedThroughFruitGame)
router.get('/usersWonBySeat3Patti',wonAtSeats)
router.post('/changePhoneNo',SENDchangePhoneNumberOTP)
router.post('/verifyChangePhonoNoOtp',verifyChangePhoneNo)
router.post('/changePassword',changePassword)
router.post('/blockUser',blockAUser)
router.post('/unblockUser',unblock)
router.post('/blockList',getMyBlockedList)


module.exports= router
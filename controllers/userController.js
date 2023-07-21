const express=require('express')
const User = require('../models/userModel')
const passport = require('passport');
const crypto = require('crypto')
const twilio= require('twilio')
const bcrypt= require('bcrypt')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')//mujha karan dou
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { sendNotification } = require('../notifications/notificationService');
const { readlinkSync } = require('fs');
const _ = require('underscore');

exports.Signup = async (req,res)=>{

    const {name,email,password,phoneNo,profilePic,coverPhoto,gender,country,relationship,isVIP,coins}=req.body;
    try{
      
       if(!email || !password ){
             return   res.status(400).json({message:"Please fill the required Credentials"} );
          }
          const userExists = await User.findOne({email:email});
       if (userExists){
           console.log('user already exists')
           return res.status(400).json({message:'This user already exists!'})
       }
       else{
        const otp = 7777;

        const ttl = 1000 * 60 * 2; // 2 min
        const expires = Date.now() + ttl;
        const data = `${phoneNo}.${otp}.${expires}`;
        const hash=crypto.createHmac('sha256',"shazo").update(data).digest('hex');
      
        const accountSid = 'ACc7170e203cd0ac7314076ff4f7a06bd0';
        const authToken = 'a0449104035e03b2a368ccc27d302a87';//pass changed
        const client = twilio(accountSid, authToken);
        client.messages.create({
          body: `Your App OTP is ${otp} and hash: ${hash}.${expires}`,
          from: +19894479702, // Twilio phone number
          to: phoneNo // Recipient's phone number
         })
        .then(message => console.log('Message sent:', message.sid))
        .catch(error => console.error('Error:', error));


            const hashed =await bcrypt.hash(password,10);
            const user =new User({name,email,password:hashed,phoneNo,profilePic,coverPhoto,gender,country,relationship,coins,isVIP});
            await user.save();
            console.log('user registered')
          return  res.status(200).json({message:'User Signup in process.verify otp'});
       
       }
    }
    catch(error) {
       console.log(error.message);
       res.status(404).json({error});
    }  

}

exports.verifyOtp = async(req,res)=>{
try {
  const { Otp, Hash, phoneNo } = req.body;
  if (!Otp || !Hash || !phoneNo) {
      res.status(400).json({ message: 'All fields are required!' });
  }

  const [hashedOtp, Expires] = Hash.split('.');
  if (Date.now() > +Expires) {
      res.status(400).json({ message: 'OTP expired!' });
  }

  const Data = `${phoneNo}.${Otp}.${Expires}`;
  let computedHash =   crypto.createHmac('sha256',"shazo").update(Data).digest('hex');
  const isValid =   computedHash === hashedOtp; 
  console.log('isvalid',isValid)

  if (!isValid) {
      const user  = User.findOne({phoneNo:phoneNo})
      const deleted  = User.findByIdAndDelete(user._id)
      res.status(400).json({ message: 'Invalid OTP,user deleted',deleted });
  }
  
   return res.status(200).json({messages:"User verified successfully"})
      

} catch (error) {
  console.log(error.message)
  res.status(404).json({error})
}

}

exports.login= async(req,res)=>{

    const {email ,password,phoneNo}= req.body;
    try{
        console.log('in login try')
     if(!email || !password || !phoneNo){ return  res.status(400).json({message:'Please fill Credendials!'}); }
      const loggin = await User.findOne({email:email})
      if (loggin && (await bcrypt.compare(password,loggin.password))){
         console.log('making token')
         const {_id,email,phoneNo}=loggin
         const token = jwt.sign({_id,email,phoneNo},process.env.secretkey)
         res.status(200).json({"token":token})
      }else{
        res.status(400).json({message:"Invalid Credentials"})
      }
    }catch(error){
    console.log(error.message)
    res.status(401).json({error});
}
}


exports.loginWithGoogle= async (req,res)=>{
     const{email,password}= req.body
    passport.use(new GoogleStrategy({
     clientID: email, clientSecret:password, callbackURL: '/auth/google/callback',
      },async (accessToken, refreshToken, profile, done) => {
      
      
        // Example: Save user information to the database
        User.findOne({ googleId: email })
          .then((existingUser) => {
            if (existingUser) {
              // User already exists in the database
              done(null, existingUser);
            } else {
              // Create a new user in the database
        
              const newUser = new User({
                googleId: email,
                name: existingUser.name,
                email: existingUser.email,
                googlePass: passport
              });
              newUser.save()
                .then((user) => {
                  done(null, user);
                })
                .catch((err) => {
                  done(err);
                });
            }
          })
          .catch((err) => {
            done(err);
          });
      }));
}


exports.loginWithFacebook= async(req,res)=>{
    const{email,password}= req.body
    
    passport.use(new FacebookStrategy({
        clientID: email,
        clientSecret: password,
        callbackURL: '/auth/facebook/callback',
      }, (accessToken, refreshToken, profile, done) => {
 
        User.findOne({ facebookId:email })
        .then((existingUser) => {
          if (existingUser) {
            // User already exists in the database
            done(null, existingUser);
          } else {
            // Create a new user in the database
            const newUser = new User({
              facebookId: email,
              name: existingUser.name,
              email:existingUser.email,
              facebookPass:password
            });
            newUser.save()
              .then((user) => {
                done(null, user);
              })
              .catch((err) => {
                done(err);
              });
          }
        })
        .catch((err) => {
          done(err);
        });
      }));
}

exports.loginWithTwitter = async(req,res)=>{
    const{email,password}=req.body;
    passport.use(new TwitterStrategy({
        consumerKey: email,
        consumerSecret: password,
        callbackURL: '/auth/twitter/callback',
      }, (token, tokenSecret, profile, done) => {
        // Example: Save user information to the database
        User.findOne({ twitterId: email })
          .then((existingUser) => {
            if (existingUser) {
              // User already exists in the database
              done(null, existingUser);
            } else {
              // Create a new user in the database
              const newUser = new User({
                twitterId: email,
                name: existingUser.name,
                email:existingUser.email,
                twitterPass:password
              });
              newUser.save()
                .then((user) => {
                  done(null, user);
                })
                .catch((err) => {
                  done(err);
                });
            }
          })
          .catch((err) => {
            done(err);
          });
      }));

}


exports.getUser= async(req,res)=>{
    try{
     
        let user = await User.findById({_id:req.params.id})
        if(user){
           res.status(200).json({user});
        }
        else{
           return res.status(404).json({message:"User doesnt exist"})
        }
  }catch(error){
     res.status(404).json({"error getting user":error});
  }
}



exports.updateuser=async(req,res)=>{
     
    let update = req.body;
    try{
    const  updated  = await User.findByIdAndUpdate(req.params.id,update,{new:true});
    res.status(200).json({success:true, user:updated});
   }catch(error){
    res.json({error})  
   }
}

exports.deleteuser = async(req,res)=>{
    try {
       let deleted = await User.findByIdAndDelete(req.params.id);
       console.log("deleted user:",deleted)
       if(deleted===null) return res.status(400).json({message:"User doesn't exist or already deleted"})
       res.status(200).json({success:true,deletedUser:deleted,message:"User deleted successfully"},)
 
    } catch (error) {
       console.log(error);
       res.status(400).json({error})
    }
 
 }
// exports.likeUser = async(req,res)=>{
// try {
//      const{userId,fanId}= req.body;
//       const user = await User.findById(userId)
//       if(!user) 
//        { return res.status(400).send("no such user exists")}
//       const fan = await User.findById(fanId);
//       if(!fan)
//          { return res.status(400).send("no such fan user exists")}
//       console.log('user is',user)
//       console.log('fan user is',fan)
//        console.log('checking if user already liked')
//     //  console.log('user likes are',user.likes)
//       if(user.likes.includes(fan)){
//         return res.status(400).json({message:"User already liked by fan"})
//       }

      
//       await user.likes.unshift(fan);
//       await user.save();
//       return res.status(200).json({message:"user liked by fan",user,fan});

// } catch (error) {
//   console.log(error)
//   res.status(400).json({error})
// }

// }

// exports.likeUser = async (req, res) => {
//   try {
//     const { userid, fanid } = req.body;

//     // Find the user by ID
//     const user = await User.findById(userid);

//     if (!user) {
//       return res.status(404).json({ message: "No such user exists" });
//     }

//     // Find the fan user by ID
//     const fan = await User.findById(fanid);

//     if (!fan) {
//       return res.status(404).json({ message: "No such fan user exists" });
//     }

//     console.log("Checking if user is already liked by the fan");
//     console.log(user);

//     // Check if the fan is already in the user's likes array
//     if (user.likes.includes(fan._id)) {
//       return res.status(400).json({ message: "User already liked by fan" });
//     }

//     // Add the fan ID to the user's likes array
//     user.likes.push(fan._id);
//     await user.save();

//     return res
//       .status(200)
//       .json({ message: "User liked by fan", user: user, fan: fan });
//   } catch (error) {
//     console.error("Error occurred while liking user:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
exports.likeUser = async(req,res)=>{
  try {
      const {userId} = req.params
       const{fanId}= req.body;
        const user = await User.findOne({userId})
        // if(!user) 
        //  { return res.status(400).send("no such user exists")}
        const fan = await User.findOne(fanId);
        // if(!fan)
        //    { return res.status(400).send("no such fan user exists")}
        console.log('user is',user)
        console.log('fan user is',fan)
         console.log('checking if user already liked')
      //  console.log('user likes are',user.likes)
        if(user.likes.includes(fan)){
          return res.status(400).json({message:"User already liked by fan"})
        }
  
        
        await user.likes.unshift(fan);
        await user.save();
        return res.status(200).json({message:"user liked by fan",user,fan});
  
  } catch (error) {
    console.log(error)
    res.status(400).json({error})
  }
  
  }
exports.maxLiked = async (req,res)=>{
  try {
  
   
    const users = await User.find({})
    console.log(users)
    // res.status(200).json({users})
    let maxlikes=0;
    let KingId= "";
    users.map(user=> {

      if(maxlikes< user.likes.length){

      maxlikes =user.likes.length
      KingId =user._id
     
      }
    });
    console.log(KingId)
    const kingUser = await User.findById(KingId)
     console.log('most popular user is',kingUser)
    res.status(200).json({message:"most popular in fans is:",kingUser})

     
  }catch(error){
    console.log(error)
    res.status(400).json({error})
  }
}


exports.levelUp = async(req,res)=>{
 
  try{ 
  const {userid}= req.body
  const user= await User.findById(userid)

  if (user.coins == 100000){
    user.level= user.level +1;
    user.levelName= "pro "
    user.levelIcon= "icon string"
    console.log('levelup')
    return res.status(200).json({message:"level up",user})
  }else{
    res.status(400).json({message:'no level up'})
  } 

  if (user.coins == 200000){
    user.level= user.level +1;
    user.levelName= "ultra pro"
    user.levelIcon= "icon string"
    console.log('levelup')
    return res.status(200).json({message:"level up",user})
  }else{
    res.status(400).json({message:'no level up'})
  } 

  if (user.coins == 300000){
    user.level= user.level +1;
    user.levelName= "promax "
    user.levelIcon= "icon string"
    console.log('levelup')
    return res.status(200).json({message:"level up",user})
  }else{
    res.status(400).json({message:'no level up'})
  } 

  if (user.coins == 400000){
    user.level= user.level +1;
    user.levelName= "tiger"
    user.levelIcon= "icon string"
    console.log('levelup')
    return res.status(200).json({message:"level up",user})
  }else{
    res.status(400).json({message:'no level up'})
  } 

  if (user.coins == 500000){
    user.level= user.level +1;
    user.levelName= "giant tiger"
    user.levelIcon= "icon string"
    console.log('levelup')
    return res.status(200).json({message:"level up",user})
  }else{
    res.status(400).json({message:'no level up'})
  } 

  if (user.coins == 600000){
    user.level= user.level +1;
    user.levelName= "falcon"
    user.levelIcon= "icon string"
    console.log('levelup')
    return res.status(200).json({message:"level up",user})
  }else{
    res.status(400).json({message:'no level up'})
  } 
  if (user.coins == 700000){
    user.level= user.level +1;
    user.levelName= "eagle"
    user.levelIcon= "icon string"
    console.log('levelup')
    return res.status(200).json({message:"level up",user})
  }else{
    res.status(400).json({message:'no level up'})
  } 
  if (user.coins == 800000){
    user.level= user.level +1;
    user.levelName= "magnificiant"
    user.levelIcon= "icon string"
    console.log('levelup')
    return res.status(200).json({message:"level up",user})
  }else{
    res.status(400).json({message:'no level up'})
  } 
  if (user.coins == 900000){
    user.level= user.level +1;
    user.levelName= "wild lion"
    user.levelIcon= "icon string"
    console.log('levelup')
    return res.status(200).json({message:"level up",user})
  }else{
    res.status(400).json({message:'no level up'})
  } 
  if (user.coins == 1000000){
    user.level= user.level +1;
    user.levelName= "king of kings"
    user.levelIcon= "icon string"
    console.log('levelup')
    return res.status(200).json({message:"level up",user})
  }else{
    res.status(400).json({message:'no level up'})
  } 



  }catch(error){
    res.status(404).json(error)
  }
}

exports.liveSession = async(req,res)=>{

  try {
    // Helper function to create a fake bot user
function createFakeBotUser() {
  const fakeBotUserId = generateUniqueUserId();
  const fakeBotUser = {
    _id: fakeBotUserId,
    name: "Bot User",
    isBot: true,
  };

  return fakeBotUser;
}

function generateUniqueUserId() {
  return uuidv4()

}
    
   const {userid, liveid} = req.body
   const user = await User.findById(userid)
   if(!user)
    { return res.status(400).send("no such user exists")}

   const live = await User.findById(liveid);
   if(!live)
      { return res.status(400).send("no such fan user exists")}
   

        const already= user.lives.includes(live)
      if(already){
        console.log('user already in live seesion')
      }
      user.lives.push(live);
      const fakeBotUsers = [];
      for (let i = 0; i < 8; i++) {
        const fakeBotUser = createFakeBotUser();//call to fuc
        fakeBotUsers.push(fakeBotUser);
        user.lives.push(fakeBotUser);
      }
      await user.save();
      const numberOfUsers = user.lives.length;
      res.status(200).json({message:" no of users watching this video", numberOfUsers });




  } catch (error) {
    
  }
}
// exports.liveSession = async (req, res) => {
//   try {
//     const { userid, liveid } = req.body;

//     // Find the real user
//     const user = await User.findById(userid);
//     if (!user) {
//       return res.status(400).send("No such user exists");
//     }

//     // Find the live video
//     const live = await User.findById(liveid);
//     if (!live) {
//       return res.status(400).send("No such live video exists");
//     }

//     // Add the real user to the live session
//     user.lives.push(live);

//     // Create fake bot users
//     const fakeBotUsers = [];
//     for (let i = 0; i < 8; i++) {
//       const fakeBotUser = createFakeBotUser();
//       fakeBotUsers.push(fakeBotUser);
//       user.lives.push(fakeBotUser);
//     }

//     // Save the user with the live session and fake bot users
//     await user.save();

//     // Return the number of users watching the video (real user + fake bot users)
//     const numberOfUsers = user.lives.length;
//     res.status(200).json({ numberOfUsers });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// };

// // Helper function to create a fake bot user
// function createFakeBotUser() {
//   // Generate a unique ID for the fake bot user
//   const fakeBotUserId = generateUniqueUserId();

//   // Create a fake bot user object with necessary properties
//   const fakeBotUser = {
//     _id: fakeBotUserId,
//     name: "Bot User",
//     isBot: true,
//     // Add any additional properties needed for the fake bot user
//   };

//   return fakeBotUser;
// }

// // Helper function to generate a unique ID for the fake bot user
// function generateUniqueUserId() {
//   // Logic to generate a unique ID for the fake bot user
//   // You can use a library like uuid or any other method to generate unique IDs
// }

exports.luxuryGift=async(req,res)=>{
     try {
       const{senderid,recieverid,coins}= req.body
       const sender = await User.findById(senderid)
       if(!sender)
       { return res.status(400).send("no such sender")}
       const reciever= await User.findById(recieverid)
       if(!reciever)
       { return res.status(400).send("no such reciever exists")}

       const actualCoins = 0.9 * coins
       reciever.coins = reciever.coins + actualCoins;

       sender.coins= sender.coins - coins;
      return res.status(200).json({message:"gift awarded",sender,reciever})
     } catch (error) {
      console.log(error)
      res.status(400).json(error)
     }

}

exports.luckyGift=async(req,res)=>{
  try {
    const{senderid,recieverid,coins}= req.body
    const sender = await User.findById(senderid)
    if(!sender)
    { return res.status(400).send("no such sender exists")}
    const reciever= await User.findById(recieverid)
    if(!reciever)
    { return res.status(400).send("no such reciever exists")}

    const actualCoins = 0.1 * coins
    reciever.coins = reciever.coins + actualCoins;

    sender.coins= sender.coins - coins;
    return res.status(200).json({message:"gift awarded",sender,reciever})
  } catch (error) {
   console.log(error)
   res.status(400).json(error)
  }

}


exports.handleSuperJackpot = async (req, res) => {
  try {
    const { userId, coinAmount } = req.body;

    // Validate request body
    if (!userId || !coinAmount) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Find the user in the database using their ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user fulfills the requirements for the super jackpot
    // Let's assume the requirements are being a VIP user and having a minimum coin amount
    const isVIPUser = user.isVIP;
    const hasMinimumCoins = user.coins >= coinAmount;
    console.log(hasMinimumCoins)

    if (!isVIPUser || !hasMinimumCoins) {
      return res.json({ message: 'You are not eligible for the Super Jackpot!' });
    }

    // If the user is eligible, calculate the super jackpot prize (let's assume a random number between 1000 and 5000 coins)
    const superJackpotPrize = Math.floor(Math.random() * (5000 - 1000 + 1) + 1000);


    // Award the user with the super jackpot prize
    user.coins += superJackpotPrize;
    await user.save();

    // Trigger a notification for the user about winning the Super Jackpot
    sendNotification(userId, `Congratulations! You won ${superJackpotPrize} coins in the Super Jackpot!`);

    return res.json({ message: `Congratulations! You won ${superJackpotPrize} coins in the Super Jackpot!` });
  } catch (error) {
    console.error('Error processing Super Jackpot:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


exports.handleSingleSend = async (req, res) => {
  try {
    const { senderId, coinCollectionProbabilities } = req.body;

    // Validate request body
    if (!senderId || !coinCollectionProbabilities || !Array.isArray(coinCollectionProbabilities)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Find the sender in the database using their ID
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    // Function to calculate the coin collection outcome based on provided probabilities
    const getCoinCollectionOutcome = () => {
      const randomNumber = Math.random();
      let cumulativeProbability = 0;

      for (const { coins, probability } of coinCollectionProbabilities) {
        cumulativeProbability += probability;
        if (randomNumber < cumulativeProbability) {
          return coins;
        }
      }

      // If no match was found, return 0 (no coins collected)
      return 0;
    };

    // Calculate the coin collection outcome
    const collectedCoins = getCoinCollectionOutcome();

    // Deduct defined percentage (e.g., 5%) as transaction fee
    const transactionFeePercentage = 5;
    const transactionFee = (collectedCoins * transactionFeePercentage) / 100;
    const collectedCoinsAfterFee = collectedCoins - transactionFee;

    // Save the single send transaction in the database
    const transaction = {
      senderId,
      collectedCoins: collectedCoinsAfterFee,
      coinCollectionProbabilities,
      transactionType: 'singleSend',
      timestamp: new Date(),
      // Add other relevant data here if needed
    };

    // Save the transaction to the database
    sender.transactions.push(transaction);
    await sender.save();

    return res.json(transaction);
  } catch (error) {
    console.error('Error processing single send:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


exports.handleComboSend = async (req, res) => {
  try {
    const { senderId, coinCollectionProbabilities } = req.body;

    // Validate request body
    if (!senderId || !coinCollectionProbabilities || !Array.isArray(coinCollectionProbabilities)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Find the sender in the database using their ID
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    // Function to calculate the coin collection outcome based on provided probabilities
    const getCoinCollectionOutcome = () => {
      const randomNumber = Math.random();
      let cumulativeProbability = 0;

      for (const { coins, probability } of coinCollectionProbabilities) {
        cumulativeProbability += probability;
        if (randomNumber < cumulativeProbability) {
          return coins;
        }
      }

      // If no match was found, return 0 (no coins collected)
      return 0;
    };

    // Calculate the coin collection outcome
    const collectedCoins = getCoinCollectionOutcome();

    // Deduct defined percentage (e.g., 5%) as transaction fee
    const transactionFeePercentage = 5;
    const transactionFee = (collectedCoins * transactionFeePercentage) / 100;
    const collectedCoinsAfterFee = collectedCoins - transactionFee;

    // Save the combo send transaction in the database
    const transaction = {
      senderId,
      collectedCoins: collectedCoinsAfterFee,
      coinCollectionProbabilities,
      transactionType: 'comboSend',
      timestamp: new Date(),
      // Add other relevant data here if needed
    };

    // Save the transaction to the database
    sender.transactions.push(transaction);
    await sender.save();

    return res.json(transaction);
  } catch (error) {
    console.error('Error processing combo send:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.fruitCoinGame = async (req, res) => {
  
  let gameStartTime = null;
  try {
    const { userid, betCoins } = req.body;
    const user = await User.findById(userid);
    if (!user) {
      return res.status(400).send('No user found');
    }

    // Check if the user is blocked and the block has not expired
    if (user.blockExpiresAt && user.blockExpiresAt > new Date()) {
      const remainingTime = (user.blockExpiresAt - new Date()) / (1000 * 60 * 60);
      return res.status(403).json({ error: `You are blocked. Try again after ${remainingTime.toFixed(2)} hours` });
    }
    
     // Check if the game session has started (first request)
     if (!gameStartTime) {
      // If the game session has not started, set the gameStartTime to the current time
      gameStartTime = new Date();
    }
  //  console.log('startTime',gameStartTime)
    // Calculate the elapsed time since the game session started (in seconds)
    const currentTime = new Date();
    const elapsedTimeSeconds = Math.floor((currentTime - gameStartTime) / 1000);
    // console.log("time in seconds",elapsedTimeSeconds)

    // Check if the elapsed time is within the 25-second limit
    if (elapsedTimeSeconds >= 25) {
      return res.status(403).json({ error: 'Betting is not allowed after 25 seconds' });
    }
    // Check if the user has more than 5 million coins today
    // console.log('current time',currentTime)
    console.log(currentTime.getFullYear(),currentTime.getMonth(),currentTime.getDate())
    const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
    // console.log(today)
    const todayTransactions = user.transactions.filter((t) => t.timestamp >= today);
    // console.log(todayTransactions)
    const totalCoinsWonToday = todayTransactions.reduce((total, t) => total + t.collectedCoins, 0);
    // console.log(totalCoinsWonToday)

    if (totalCoinsWonToday >= 5000000) {
      return res.status(403).json({ error: 'You have reached the daily coin win limit' });
    }
    const coinString = betCoins.toString();
    let  coins   =parseInt(coinString.replace("k",""))
    console.log(coins)
    coins*= 1000;
    if (user.coins < coins) {
      return res.status(400).send('You don\'t have enough coins');
    }

    const cards = ['apple', 'grapes', 'orange'];
    const card = _.sample(cards);

    let rewardedCoins = 0;
    if (card === 'apple' || card === 'orange') {
      
       rewardedCoins = coins * 2
      console.log('reward',rewardedCoins)
      user.coins += rewardedCoins;
      await user.save();
     
    } else {
     
      rewardedCoins = coins * 7
      console.log('reward',rewardedCoins)
      user.coins += rewardedCoins;
    
      await user.save();
    }

 

    // Update the user's game history
    const transaction = {
      collectedCoins: rewardedCoins ,
      betCoins,
      card,
      timestamp: new Date(),
    };
    user.transactions.push(transaction);
    await user.save();
    console.log('reward after save',rewardedCoins)
    res.status(200).json({
      message: `Congratulations! You earned ${card} card. Reward: ${rewardedCoins} coins`,
      card,
      rewardedCoins,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUserGameHistory = async (req, res) => {
  try {
    const { userid } = req.params;
    const user = await User.findById(userid);
    if (!user) {
      return res.status(400).send('No user found');
    }

    res.status(200).json(user.transactions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.teenPatti = async(req,res)=>{
  let gameStartTime = null
  try {
    const { userid1,userid2,userid3, betCoins } = req.body;
    const user1 = await User.findById(userid1);
    if (!user1) {
      return res.status(400).send('No user found');
    }
    const user2 = await User.findById(userid2);
    if (!user2) {
      return res.status(400).send('No user found');
    }
    const user3 = await User.findById(userid3);
    if (!user3) {
      return res.status(400).send('No user found');
    }
    const coinString = betCoins.toString();
    let  coins   =parseInt(coinString.replace("k",""))
    console.log(coins)
    coins*= 1000;
    if (user1.coins < coins) {
      return res.status(400).send('You don\'t have enough coins');
    }
    if (user2.coins < coins) {
      return res.status(400).send('You don\'t have enough coins');
    }
    if (user3.coins < coins) {
      return res.status(400).send('You don\'t have enough coins');
    }

    
    if(!gameStartTime){
       gameStartTime=new Date();
    }
    const currentTime = new Date();
    const elapsedTimeSeconds= Math.floor((currentTime-gameStartTime)/1000)

    if(elapsedTimeSeconds >= 20){
      return res.status(401).json({ message:"Only 5 seconds are left for betting coins" });
    }
    
    const cards = [{card1:"A red ♥",card2:"A black ☘",card3:"A black🍀",card4:"A red 🎲",power:6},
    {card1:"A red 🎲",card2:"K red 🎲",card3:"Q red 🎲",power:5},
    {card1:"A black ☘",card2:"K red ♥",card3:"Q red 🎲",power:4},
    {card1:"A red 🎲",card2:"K red 🎲",card3:"J red 🎲",power:3},
    {card1:"A black🍀",card2:"A red 🎲",card3:"K black ☘",power:2},
    {card1:"A  black ☘",card2:"K black ☘ ",card3:"J black🍀",power:1}]

    const first = _.sample(cards)
    const second= _.sample(cards)
    const third= _.sample(cards)
    const competingCards = [first,second,third]

    //  const competingCards = [_.sample(cards),_.sample(cards),_.sample(cards)]
   
    // console.log("compieting cards are",competingCards)
    if(elapsedTimeSeconds >= 27){
     return res.status(401).json({ message:"Cards compieting for win are ",competingCards});
   }
    let winUserId=""
     let winner=0
     let winIndex=0
     let winnerCard={}
    competingCards.map((card)=>{
        if(winner < card.power)
        {  winner=card.power
          winnerCard= card
          winIndex= competingCards.indexOf(card)
          }
     })
     console.log("index user",winIndex)
     if(winIndex == 0){
      winUserId=user1._id
      user1.coins*=2.9
      await user1.save()
     }
     else if(winIndex == 1){
      winUserId=user2._id
      user2.coins*=2.9
      await user2.save()
     }
     else{
      winUserId=user3._id
      user3.coins*=2.9
      await user3.save()
     }
    const winnerUser = await User.findById(winUserId)

     console.log( "winner power",winner)
     console.log( "winner card",winnerCard)

     if(elapsedTimeSeconds >= 29){
      return res.status(200).json({ message:`Compeiting cards and the winner card with max power is `,competingCards,winnerCard,winnerUser});
    }
     res.status(200).json({message:`Compeiting cards and the winner card User with max power is `,competingCards,winnerCard,winnerUser})

  } catch (error) {
    console.log(error)
    res.status(400).json({error})
  }
}


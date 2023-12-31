const express=require('express')
const User = require('../models/userModel')
const Post = require('../models/postModel')
const passport = require('passport');
const crypto = require('crypto')
const twilio= require('twilio')
const bcrypt= require('bcrypt')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { sendNotification } = require('../notifications/notificationService');
const { readlinkSync } = require('fs');
const _ = require('underscore');
const { setBoxProbabilities,getBoxProbabilities } = require('../middleware/winMiddle');
exports.Signup = async (req,res)=>{

    const {name,email,password,phoneNo,gender,country,interest,relationship,isVIP,coins,isBan}=req.body;
    // const {profilePic,coverPic }= req.body
    
    const  profilePic= req.files[0].path
    const  coverPic= req.files[1].path
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
            const user =new User({name,email,password:hashed,phoneNo,profilePic,coverPic,gender,interest,country,relationship,coins,isVIP,isBan});
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
exports.createAdmin= async(req,res)=>{
  const {name,email,password,phoneNo,gender,country,relationship,role,isVIP,coins,isBan}=req.body;
  const {profilePic,coverPic }= req.body
  
  // const  profilePic= req.files[0].path
  // const  coverPic= req.files[1].path
  try {
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
     const user =new User({name,email,password:hashed,phoneNo,profilePic,coverPic,gender,role:role,country,relationship,coins,isVIP,isBan});
    user.role="admin"
     await user.save();
     console.log('user registered')
   return  res.status(200).json({message:'admin Signup in process.verify otp'});

}  
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

exports.likeUser = async(req,res)=>{
  try {
      
       const{userId,fanId}= req.body;
        const user = await User.findById(userId)
        // if(!user) 
        //  { return res.status(400).send("no such user exists")}
        const fan = await User.findById(fanId);
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
    
   const {userid, liveid} = req.body//user hosting live,liveuser entering live session
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
      live.isBan = "false"
      live.isMute ="false"
      await live.save()
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

exports.luxuryGift=async(req,res)=>{
     try {
       const{senderid,recieverid,Coins,adminId}= req.body
       const sender = await User.findById(senderid)
       if(!sender)
       { return res.status(400).send("no such sender")}
       const reciever= await User.findById(recieverid)
       if(!reciever)
       { return res.status(400).send("no such reciever exists")}
       const admin = await User.findById(adminId);

       if (!admin) {
         return res.status(404).json({ error: 'admin not found' });
       }

       const coinString = Coins.toString();//asuming coins sent as 10k or 4k
       const   coins   =parseInt(coinString.replace("k",""))
       console.log(coins)
       coins*= 1000;
       if (sender.coins < coins) {//check if user has coins or not
         return res.status(400).send('You don\'t have enough coins to send gift');
       }
   
       sender.coins-=coins;
       await sender.save()//cut sender coins

       
       const adminCoins = 0.1*coins//10n perc to admin
       admin.coins+=adminCoins
       const atransaction = {
        senderid,
        recieverid,
        lostCoins: actualCoins,
        collectedCoins:adminCoins,
        gift: 'luxury',
        timestamp: new Date(),
      };
  
      // Save the transaction to the database
      admin.transactions.push(atransaction);
       await admin.save()


       const actualCoins = 0.9 * coins//send 90 to reveier
       reciever.coins+=actualCoins;
       const transaction = {
        senderid,
        collectedCoins: actualCoins,
        admin:adminCoins,
        gift: 'luxury',
        timestamp: new Date(),
      };
  
      // Save the transaction to the database
      reciever.transactions.push(transaction);
       await reciever.save()

      return res.status(200).json({message:"gift awarded",sender,reciever})
     } catch (error) {
      console.log(error)
      res.status(400).json(error)
     }

}

exports.luckyGift=async(req,res)=>{
  try {
    const{senderid,recieverid,Coins,adminId}= req.body
    const sender = await User.findById(senderid)
    if(!sender)
    { return res.status(400).send("no such sender exists")}
    const reciever= await User.findById(recieverid)
    if(!reciever)
    { return res.status(400).send("no such reciever exists")}
    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({ error: 'admin not found' });
    }
    const coinString = Coins.toString();
    const   coins   =parseInt(coinString.replace("k",""))
    console.log(coins)
    coins*= 1000;
    if (sender.coins < coins) {
      return res.status(400).send('You don\'t have enough coins to send gift');
    }

    sender.coins= sender.coins - coins;
    await sender.save()//cut coins from recever

    const adminCoins= 0.9*coins// 90 prc coins to admin and save
    admin.coins+= adminCoins
    const atransaction = {
      senderid,
      recieverid,
      lostCoins: actualCoins,
      collectedCoins:adminCoins,
      gift: 'lucky',
      timestamp: new Date(),
    };

    // Save the transaction to the database
    admin.transactions.push(atransaction);
    await admin.save()

    const actualCoins = 0.1 * coins// 10 prc coins to reviver  andsave 
    reciever.coins = reciever.coins + actualCoins;
    const transaction = {
      senderid,
      collectedCoins: actualCoins,
      admin:adminCoins,
      gift: 'lucky',
      timestamp: new Date(),
    };

    // Save the transaction to the database
    reciever.transactions.push(transaction);
    await reciever.save()
  

    return res.status(200).json({message:"gift awarded",sender,reciever})
  } catch (error) {
   console.log(error)
   res.status(400).json(error)
  }

}


exports.handleSuperJackpot = async (req, res) => {
  try {
    const { userId, coinAmount ,adminId} = req.body;

    // Validate request body
    if (!userId || !coinAmount) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Find the user in the database using their ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({ error: 'admin not found' });
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

    // Deduct the prize from admin's coins
    admin.coins -= superJackpotPrize;
    const atransaction = {
      userId,
      adminId,
      lostCoins: superJackpotPrize,
      gift: 'superJackpot',
      timestamp: new Date(),
    };

    // Save the transaction to the database
    admin.transactions.push(atransaction);
    await admin.save();
    
    // Award the user with the super jackpot prize
    user.coins += superJackpotPrize;
    const transaction = {
      userId,
      adminId,
      collectedCoins: superJackpotPrize,
      gift: 'superJackpot',
      timestamp: new Date(),
    };

    // Save the transaction to the database
    admin.transactions.push(transaction);
    await user.save();
    
    // Trigger a notification for the user about winning the Super Jackpot
    sendNotification(userId, `Congratulations! You won ${superJackpotPrize} coins in the Super Jackpot!`);
    
    return res.json({ message: `Congratulations! You won ${superJackpotPrize} coins in the Super Jackpot!` });
  }catch (error) {
    console.error('Error processing Super Jackpot:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


exports.handleSingleSend = async (req, res) => {
  try {
    const { senderId, coinCollectionProbabilities,adminId } = req.body;

    // Validate request body
    if (!senderId || !coinCollectionProbabilities || !Array.isArray(coinCollectionProbabilities)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Find the sender in the database using their ID
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }
   
    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({ error: 'admin not found' });
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

    sender.coins+=collectedCoinsAfterFee
      // Save the single send transaction in the database
      const transaction = {
        collectedCoins: collectedCoinsAfterFee,
        coinCollectionProbabilities,
        transactionType: 'singleSend',
        timestamp: new Date(),
      };
      sender.transactions.push(transaction);
    await sender.save()     
    admin.coin+=transactionFee
    const atransaction = {
      collectedCoins: transactionFee,
      coinCollectionProbabilities,
      transactionType: 'singleSend',
      timestamp: new Date(),
    };
    admin.transactions.push(atransaction);
    await admin.save();

    return res.json(transaction,atransaction);
  } catch (error) {
    console.error('Error processing single send:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 


exports.handleComboSend = async (req, res) => {
  try {
    const { senderId, coinCollectionProbabilities ,adminId} = req.body;
 
    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({ error: 'admin not found' });
    }
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
    
    admin.coins+=collectedCoinsAfterFee
    const atransaction = {
      collectedCoins: transactionFee,
      coinCollectionProbabilities,
      transactionType: 'comboSend',
      timestamp: new Date(),
    };
    admin.transactions.push(atransaction);
    await admin.save()//admin save give coins to admin

    const transaction = {
      collectedCoins: collectedCoinsAfterFee,
      coinCollectionProbabilities,
      transactionType: 'comboSend',
      timestamp: new Date(),
    };
    sender.transactions.push(transaction);
    await sender.save()   

    return res.json(transaction);
  } catch (error) {
    console.error('Error processing combo send:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.fruitCoinGame = async (req, res) => {
  
  let gameStartTime = null;
  try {
    const { userid, betCoins,adminId } = req.body;
    const user = await User.findById(userid);
    if (!user) {
      return res.status(400).send('No user found');
    }
    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({ error: 'admin not found' });
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
    admin.coins+=coins
    await admin.save()
    const cards = ['apple', 'grapes', 'orange'];
    const card = _.sample(cards);

    let rewardedCoins = 0;
    if (card === 'apple' || card === 'orange') {
       rewardedCoins = coins * 2
      console.log('reward',rewardedCoins)
      admin.coins-=rewardedCoins
      await admin.save()
      user.coins += rewardedCoins;
      await user.save();
     
    } else {
     
      rewardedCoins = coins * 7
      console.log('reward',rewardedCoins)
      admin.coins-=rewardedCoins
      await admin.save()
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
  const SECONDS_FOR_BETTING = 25;
  const SECONDS_FOR_CARD_SHOW = 3;
  const SECONDS_FOR_USER_SHOW = 2;
  
  let gameStartTime = null;
  
  // Function to wait for the specified number of seconds
  function wait(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
  try {
    const { users, betCoins,adminId } = req.body;
    for(const user of users){
        const isExists =    await User.findById(user.userid)
        if (!isExists) {
          return res.status(400).json({message:` A user  do not exist`});
        }
    }
    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({ error: 'admin not found' });
    }

    const coinString = betCoins.toString();
    let  betcoins  =parseInt(coinString.replace("k",""))
    console.log(betcoins)
    betcoins*= 1000;
    for( const user of users){
      if(user.coins < betcoins){
        return res.status(400).send('You don\'t have enough coins');
      }
    }
    //all has coins so give them to admin
    const admincoins = (users.length )* betcoins
    admin.coins+=admincoins
    await admin.save()
    if(!gameStartTime){
       gameStartTime=new Date();
    }
    
    let currentTime = new Date();
    let elapsedTimeSeconds = Math.floor((currentTime - gameStartTime) / 1000);
    if (elapsedTimeSeconds >= SECONDS_FOR_BETTING) {
      return res.status(401).json({ message: "Betting time is over" });
    }
    await wait(SECONDS_FOR_BETTING - elapsedTimeSeconds);//first call to promise
    const cards = [
      //sequence 1 cards
    {card1:"A red ♥",card2:"A black ☘",card3:"A black🍀",power:71},
    {card1:"K red ♥",card2:"K black ☘",card3:"K black🍀",power:70},
    {card1:"Q red ♥",card2:"Q black ☘",card3:"Q black🍀",power:69},
    {card1:"J red ♥",card2:"J black ☘",card3:"J black🍀",power:68},
    {card1:"10 red ♥",card2:"10 black ☘",card3:"10 black🍀",power:67},
    {card1:"9 red ♥",card2:"9 black ☘",card3:"9 black🍀",power:66},
    {card1:"8 red ♥",card2:"8 black ☘",card3:"8 black🍀",power:65},
    {card1:"7 red ♥",card2:"7 black ☘",card3:"7 black🍀",power:64},
    {card1:"6 red ♥",card2:"6 black ☘",card3:"6 black🍀",power:63},
    {card1:"5 red ♥",card2:"5 black ☘",card3:"5 black🍀",power:62},
    {card1:"4 red ♥",card2:"4 black ☘",card3:"4 black🍀",power:61},
    //sequence 2 cards
    {card1:"A red 🎲",card2:"K red 🎲",card3:"Q red 🎲",power:60},
    {card1:"A red 🎲",card2:"10 red 🎲",card3:"9 red 🎲",power:59},
    {card1:"K red 🎲",card2:"Q red 🎲",card3:"J red 🎲",power:57},
    {card1:"A red 🎲",card2:"9 red 🎲",card3:"8 red 🎲",power:57},
    {card1:"Q red 🎲",card2:"J red 🎲",card3:"10 red 🎲",power:56},
    {card1:"A red 🎲",card2:"8 red 🎲",card3:"7 red 🎲",power:55},
    {card1:"10 red 🎲",card2:"9 red 🎲",card3:"8 red 🎲",power:54},
    {card1:"A red 🎲",card2:"7 red 🎲",card3:"8 red 🎲",power:53},
    {card1:"8 red 🎲",card2:"7 red 🎲",card3:"6 red 🎲",power:52},
    {card1:"A red 🎲",card2:"2 red 🎲",card3:"3 red 🎲",power:51},
    {card1:"6 red 🎲",card2:"5 red 🎲",card3:"4 red 🎲",power:50},
    {card1:"4 red 🎲",card2:"3 red 🎲",card3:"2 red 🎲",power:49},
     //sequence 3
    {card1:"A black ☘",card2:"K red ♥",card3:"Q red 🎲",power:48},
    {card1:"A red ♥",card2:"2 red 🍀 ",card3:"3 red ☘",power:47},
    {card1:"K red ☘",card2:"Q red 🎲",card3:"J red 🍀",power:46},
    {card1:"4 black 🍀",card2:"3 black ☘",card3:"2 black 🍀",power:45},
     //sequence 4
    {card1:"A red 🎲",card2:"K red 🎲",card3:"J red 🎲",power:44},
    {card1:"A black 🍀",card2:"K black 🍀",card3:"10 black 🍀",power:43},
    {card1:"A black 🍀",card2:"K black 🍀",card3:"9 black 🍀",power:42},
    {card1:"A black 🍀",card2:"K black 🍀",card3:"8 black 🍀",power:41},
    {card1:"K black 🍀",card2:"Q black 🍀",card3:"J black 🍀",power:40},
    {card1:"10 black 🍀",card2:"9 black 🍀",card3:"8 black 🍀",power:39},
    {card1:"7 black 🍀",card2:"6 black 🍀",card3:"5 black 🍀",power:38},
    {card1:"5 red 🎲",card2:"3 red 🎲",card3:"2 red 🎲",power:37},
    //sequence 5
    {card1:"A black🍀",card2:"A red 🎲",card3:"K black ☘",power:36},
    {card1:"A black ☘",card2:"A red 🍀",card3:"Q black ☘",power:35},
    {card1:"A black ☘",card2:"A red 🍀",card3:"J black ☘",power:34},
    {card1:"A black ☘",card2:"A red 🍀",card3:"10 black ☘",power:33},
    {card1:"A black ☘",card2:"A red 🍀",card3:"9 black ☘",power:32},
    {card1:"A black ☘",card2:"A red 🍀",card3:"8 black ☘",power:31},
    {card1:"A black ☘",card2:"A red 🍀",card3:"7 black ☘",power:30},
    {card1:"A black ☘",card2:"A red 🍀",card3:"6 black ☘",power:29},
    {card1:"A black ☘",card2:"A red 🍀",card3:"5 black ☘",power:28},
    {card1:"A black ☘",card2:"A red 🍀",card3:"4 black ☘",power:27},
    {card1:"A black ☘",card2:"A red 🍀",card3:"3 black ☘",power:26},
    {card1:"A black ☘",card2:"A red 🍀",card3:"2 black ☘",power:25},
    {card1:"K black ☘",card2:"K red 🍀",card3:"Q black ☘",power:24},
    {card1:"K black ☘",card2:"K red 🍀",card3:"J black ☘",power:23},
    {card1:"Q black ☘",card2:"Q red 🍀",card3:"10 black ☘",power:22},
    {card1:"10 black ☘",card2:"10 red 🍀",card3:"9 black ☘",power:21},
    {card1:"9 black ☘",card2:"9 black ☘",card3:"8 black ☘",power:20},
    {card1:"8 black ☘",card2:"8 black ☘",card3:"7 black ☘",power:19},
    {card1:"7 black ☘",card2:"7 black ☘",card3:"6 black ☘",power:18},
    {card1:"6 black ☘",card2:"6 black ☘",card3:"5 black ☘",power:17},
    {card1:"5 black ☘",card2:"5 black ☘",card3:"4 black ☘",power:16},
    {card1:"4 black ☘",card2:"4 black ☘",card3:"3 black ☘",power:15},
    {card1:"3 black ☘",card2:"3 black ☘",card3:"2 black ☘",power:14},
    {card1:"2 red ☘",card2:"2 black ☘",card3:"3 black ☘",power:13},
    //sequence 6
    {card1:"A  black ☘",card2:"K black ☘ ",card3:"J black🍀",power:12},
    {card1:"A  black ☘",card2:"K black ☘ ",card3:"Q black🍀",power:11},
    {card1:"A  black ☘",card2:"K black ☘ ",card3:"10 black🍀",power:10},
    {card1:"A  black ☘",card2:"K black ☘ ",card3:"9 black🍀",power:9},
    {card1:"A  black ☘",card2:"K black ☘ ",card3:"8 red 🎲",power:8},
    {card1:"A  black ☘",card2:"K black ☘ ",card3:"7 red 🎲",power:7},
    {card1:"A  black ☘",card2:"K black ☘ ",card3:"6 red 🎲",power:6},
    {card1:"A  black ☘",card2:"K black ☘ ",card3:"5 red 🎲",power:5},
    {card1:"A  black ☘",card2:"K black ☘ ",card3:"4 red 🎲",power:4},
    {card1:"A  black ☘",card2:"K black ☘ ",card3:"3 red 🎲",power:3},
    {card1:"A  black ☘",card2:"K black ☘ ",card3:"2 red 🎲",power:2},
    {card1:"5  black ☘",card2:"3 black ☘ ",card3:"2 black🍀",power:1}
  ]
    
    function excludeFirst() {
      for (let i = 0; i < cards.length; i++) {
          if (cards[i] === firstBox ){
              let spliced = cards.splice(i, 1);
              console.log("Removed element: " + spliced);
            
          }
          } }
    function excludeSecond() {
            for (let i = 0; i < cards.length; i++) {
                if (cards[i] === secondBox ){
                    let spliced = cards.splice(i, 1);
                    console.log("Removed element: " + spliced);
                  
                }
                } }

    const firstBox = _.sample(cards)
    excludeFirst()
    const secondBox= _.sample(cards)
    excludeSecond()
    const thirdBox= _.sample(cards)

    const competingCards = [firstBox,secondBox,thirdBox]
    
     console.log("compieting cards are",competingCards)
     // Calculate the probability of each box winning
  const totalPower = competingCards.reduce((total, card) => total + card.power, 0);
  const boxProbabilities = competingCards.map((card) => ({
    box: card.boxNo,
    probability: (card.power / totalPower) * 100,
    
  })) 

   
   setBoxProbabilities(boxProbabilities);//global func from middleware
    const currentTimeAfterBetting = new Date();
     const elapsedTimeSecondsAfterBetting = Math.floor((currentTimeAfterBetting - gameStartTime) / 1000);
     if (elapsedTimeSecondsAfterBetting >= SECONDS_FOR_BETTING + SECONDS_FOR_CARD_SHOW) {
       return res.status(401).json({ message: "Card show time is over" });
      }
      // Perform the card show phase (waiting for the remaining card show time)//sec0nd call to wait
      await wait(SECONDS_FOR_CARD_SHOW);
      
  
     let winner=0
     let winIndex=0
     let winnerBox={}
    competingCards.map((card)=>{
        if(winner < card.power)
        {  winner=card.power 
          winnerBox= card
          winIndex= competingCards.indexOf(card)
          }
     })
    //  console.log("win box index",winIndex)//done
let winUsers= []
let winBoxNumber=''
let userBeforeCoins=0
let rewardedCoins=0

     if(winIndex == 0){
      //first box users are winners retrive users who chose first card
 
       for(let user of users){
            if(user.boxNo === "first"){
            let winuser = await User.findById(user.userid)
            winBoxNumber="first box is winner"
            winUsers.push(winuser)
            userBeforeCoins = winuser.coins
            winuser.coins*=2.9 
            rewardedCoins= winuser.coins - userBeforeCoins
            admin.coins-=rewardedCoins
            await admin.save()
            winuser.teenPattiTrans.push({seatName:"SeatA",collectedCoins:rewardedCoins})

             await winuser.save()
            }
          }
          for(let user of users){
            if(user.boxNo != "first"){
            let lostuser = await User.findById(user.userid)
             lostuser.coins-= betcoins
             await lostuser.save()
            }
          }

    }
     else if(winIndex == 1){
      //second box users are winners
      for(let user of users){
        if(user.boxNo === "second"){
          winBoxNumber="second box is winner"
        let winuser = await User.findById(user.userid)
        winUsers.push(winuser)
        userBeforeCoins = winuser.coins
        winuser.coins*=2.9
        rewardedCoins= winuser.coins - userBeforeCoins
        console.log('rewarded coins', rewardedCoins)
        admin.coins-=rewardedCoins
        await admin.save()
        winuser.teenPattiTrans.push({seatName:"SeatB",collectedCoins:rewardedCoins})
         await winuser.save()
        }
      }
      for(let user of users){
        if(user.boxNo != "second"){
        let lostuser = await User.findById(user.userid)
         lostuser.coins-=betcoins
         await lostuser.save()
        }
      }
     }
     else{
      //third box users are winner
      for(let user of users){
        if(user.boxNo === "third"){
          winBoxNumber=" third box is winner"
        let winuser = await User.findById(user.userid)
        winUsers.push(winuser)
        userBeforeCoins = winuser.coins
        winuser.coins*=2.9
        rewardedCoins= winuser.coins - userBeforeCoins
        console.log('rewarded coins', rewardedCoins)
        admin.coins-=rewardedCoins
        await admin.save()
        winuser.teenPattiTrans.push({seatName:"SeatC",collectedCoins:rewardedCoins})
         await winuser.save()
        }
      }
      for(let user of users){
        if(user.boxNo != "third"){
        let lostuser = await User.findById(user.userid)
         lostuser.coins-=betcoins
         await lostuser.save() 
        }
      }
     
     }
  

     console.log( "winner power",winner)
     console.log( "winner box",winnerBox)

     // Check if the game is in the user show phase (within the last 2 seconds)
     const currentTimeAfterCardShow = new Date();
     const elapsedTimeSecondsAfterCardShow = Math.floor((currentTimeAfterCardShow - gameStartTime) / 1000);
     if (elapsedTimeSecondsAfterCardShow >= SECONDS_FOR_BETTING + SECONDS_FOR_CARD_SHOW + SECONDS_FOR_USER_SHOW) {
       return res.status(200).json({ message: "User show time is over" });
      }
      
      //  Perform the user show phase (waiting for the remaining user show time)
         await wait(SECONDS_FOR_USER_SHOW);


   res.status(200).json({message:`Compeiting cards and the winner card User with max power is `,boxProbabilities,competingCards,winnerBox,winBoxNumber,winUsers})

  } catch (error) {
    console.log(error)
    res.status(400).json({error})
  }
}

exports.prediction = async (req, res) => {
  try {
    const boxProbabilities = getBoxProbabilities(); //returns array
    const seatProbabilities = boxProbabilities.map((box,index) => 
     ( {
    [`seat ${String.fromCharCode(97+index)}`]: `${box.probability}%`,
      } )
    );
    res.status(200).json( seatProbabilities );
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};



exports.coinsCollectedThroughFruitGame= async(req,res)=>{
  try {
     const {userid}= req.body
     const user = await User.findById(userid)
     if(!user){
      return res.status(400).json({message:"no such user exists in our database"})
     }
  
    
     let appleCoinsSum=0
     let grapesCoinSum=0
     let orangeCoinsSum=0
  
         user.transactions.map((trans)=>{
  
          //if user has played fruit game and has its transcation
          if('card' in trans){
          // console.log('user has card property in transcations.he has played game before')
          if(trans.card === 'apple'){
            appleCoinsSum+=trans.collectedCoins
          } 
          else if(trans.card === 'grapes'){
            grapesCoinSum+= trans.collectedCoins
          }
          else{
             orangeCoinsSum+=trans.collectedCoins
          }
  
          } 
          //comes here if this transcation is not of fruit game
          
         })
  
         res.status(200).json({message:"User history for coins collection in fruit game is",appleCoinsSum,orangeCoinsSum,grapesCoinSum})
  
  
  } catch (error) {
    console.log(error)
    res.status(400).json({error})
    
  }
  
  }


  exports.wonAtSeats = async(req,res)=>{
   
    try{
    let Acount=0
    let coinsWonAtSeatA=0
    let Bcount = 0
    let coinsWonAtSeatB=0
    let Ccount=0
    let coinsWonAtSeatC=0

    const users = await User.find({})
     
     users.map((user)=>{
         //calculates all seat for one user step by step
       user.teenPattiTrans.map((trans)=>{
        // console.log('transc detail',trans)
          if(trans.seatName === "SeatA"){
            Acount+=1
            coinsWonAtSeatA+=trans.collectedCoins
          }
         if(trans.seatName === "SeatB"){
            Bcount+=1 
            coinsWonAtSeatB+=trans.collectedCoins
          }
          if(trans.seatName === "SeatC"){
            Ccount+=1
            coinsWonAtSeatC+=trans.collectedCoins
          }
          
       })


     })

     res.status(200).json({message:"Users won with total coins collected by seat A,B,C respectively are",Acount,coinsWonAtSeatA,Bcount,coinsWonAtSeatB,Ccount,coinsWonAtSeatC})
    }catch(error){
      console.log(error)
      res.status(400).json(error)
    }

  }


  exports.SENDchangePhoneNumberOTP= async(req,res)=>{

    try {
      const {newPhoneNo}= req.body
      const otp = 7777;

      const accountSid = 'ACc7170e203cd0ac7314076ff4f7a06bd0';
      const authToken = 'a0449104035e03b2a368ccc27d302a87';//pass changed
      const client = twilio(accountSid, authToken);
      client.messages.create({
        body: `Your App OTP is ${otp}`,
        from: +19894479702, // Twilio phone number
        to: newPhoneNo // Recipient's phone number
       })
      .then(message => console.log('Message sent:', message.sid))
      .catch(error => console.error('Error:', error));
      return res.status(200).json({msg:"otp send!"})

    } catch (error) {
      console.log(error.message)
      return res.status(400).json({MSG:"ERROR CHANGING PHONEnO"})
    }
  }


  exports.verifyChangePhoneNo = async(req,res)=>{

    try {
      const {otp,oldphoneNo,newPhoneNo} = req.body
      let isCorrectOtp = otp == 7777
      console.log(isCorrectOtp)
      if(!isCorrectOtp){
        return res.status(400).json({msg:"not a valid otp code"})
      }
     const user = User.findOne({phoneNo:oldphoneNo})
       user.phoneNo= newPhoneNo
       user.verifyCount+=1
       await user.save()
      return res.status(200).json({msg:"changed your phone no ",user})
    } catch (error) {
      console.log(error.message)
      return res.status(400).json({MSG:"ERROR"})
    }
  }


  exports.changePassword= async(req,res)=>{
    try {
      const{userid,newpassword}= req.body
      const user = await User.findById(userid)
      if(user){
      user.password = await bcrypt.hash(newpassword,10); 
      await user.save()
      return res.status(200).send("password changed succesfully"
      )
      }

     return res.status(400).json({msg:"user not exists"})

    } catch (error) {
      console.log(error.message)
      return res.status(400).json({MSG:"ERROR"})
    }
  }


exports.blockAUser= async(req,res)=>{
  try {
    const {userid, toBeBlockedId}= req.body
    const user= await User.findById(userid)
    if(!user) return res.status(400).json({msg:"user not found"})
    const userToBeBlocked = await User.findById(toBeBlockedId)
     if(!userToBeBlocked) return res.status(400).json({msg:"user you trying to block doesnt exists"}) 

     const alreadyblocked = user.blocked.some((user)=> user === userToBeBlocked);
     console.log(isLiked)
     if(alreadyblocked){
         return res.json({msg:"you already blocked this user"})  
     }
     //add user in blocked list
      user.blocked.unshift(userToBeBlocked)
      await user.save()
    return res.status(400).json({msg:`you blocked ${userToBeBlocked.name}`})
    
  } catch (error) {
    console.log(error.message)
    return res.status(400).json({MSG:"ERROR"})
  }

}
exports.unblock= async(req,res)=>{
  try {
    const {userid, toBeUnBlockedId}= req.body
    const user= await User.findById(userid)
    if(!user) return res.status(400).json({msg:"user not found"})
    const userToBeUnBlocked = await User.findById(toBeUnBlockedId)
     if(!userToBeUnBlocked) return res.status(400).json({msg:"user you trying to unblock doesnt exists"}) 

     const blockedUser = user.blocked.some((user)=> user === userToBeUnBlocked);
     if(blockedUser){
      //user in block list now unblock it
      const index = user.blocked.indexOf(blockedUser)
      user.blocked.splice(index,1)
      await user.save()
      return res.status(400).json({msg:`you unblocked ${blockedUser.name}`})
     }
     return res.status(400).json({msg:`user not in block list .cannot unblock it`})

  } catch (error) {
    console.log(error.message)
    return res.status(400).json({MSG:"ERROR"})
  }
}
exports.getMyBlockedList= async(req,res)=>{
  try {
    const {userid}= req.body
    const user= await User.findById(userid)
    if(!user) return res.status(400).json({msg:"user not found"})
    return   res.status(200).json({BlockedUsers:user.blocked})
  } catch (error) {
    console.log(error.message)
    return res.status(400).json({MSG:"ERROR"})
  }
}

exports.getOnlineUsers = async(req,res)=>{

  try {
    
    const users = await User.find({isOnline:true})
    return res.status(200).json({success:true,users})
  } catch (error) {
    console.log(error.message)
    return res.status(400).json({MSG:"ERROR"})
  }
}

exports.sendFriendRequest= async(req,res)=>{
  try {
    const{senderid, reciverid}= req.body
    const sender =await User.findById(senderid)
    const reciever =await User.findById(reciverid)
      const reqDetail ={
        id:sender._id,
        profilePic:sender.profilePic,
        Name:sender.name
      }
      const alreadySent = reciever.friendRequests.map((req)=> req.id === sender._id)
      console.log(alreadySent)
      if(alreadySent.length > 0)    return res.json({msg:"request already sent"})
      reciever.friendRequests.unshift(reqDetail)
      await reciever.save()
      return res.json({msg:"friend request has been sent"})

  } catch (error) {
    console.log(error.message)
    return res.status(400).json({MSG:"ERROR"})
  }
}

exports.deleteRequest = async(req,res)=>{
  try {
    const{senderid, reciverid}= req.body
    const sender =await User.findById(senderid)
    const reciever =await User.findById(reciverid)
   const fr= reciever.friendRequests.map((req)=> req.id === sender._id)
  //  console.log(fr)
   if(fr){
    const index = reciever.friendRequests.indexOf(fr)
    reciever.friendRequests.splice(index,1)
    await reciever.save()
    return res.json({msg:"you deleted friend request "})
   }
   return res.json({msg:"you dont send any req to this user "})
  } catch (error) {
    console.log(error.message)
    return res.status(400).json({MSG:"ERRor"})
  }
}


exports.acceptFriendRequest = async(req,res)=>{
  try {
    const{senderid, reciverid}= req.body
    const sender =await User.findById(senderid)
    const reciever =await User.findById(reciverid)
    // Check if users exist
    if (!sender || !reciever) {
      return res.status(404).json({ msg: "User not found" });
    }
    // Check if the users are already friends
    if (sender.friends.some((friend) => friend._id.equals(reciever._id)) || reciever.friends.some((friend) => friend._id.equals(sender._id))) {
      return res.json({ msg: "You both are already friends" });
    }

    // Add each other to the "friends" arrays
    sender.friends.unshift(reciever);
    await sender.save();
    console.log('saving sender');

    // Reset the reference in the receiver object to avoid circular reference
    const receiverFriend = {
      _id: sender._id,
      profilePic: sender.profilePic,
      name: sender.name
    };
    reciever.friends.unshift(receiverFriend);
    await reciever.save();
    console.log('saving reciever');

    const fr= reciever.friendRequests.map((req)=> req.id === sender._id)
   if(fr.length>0){
     const index = reciever.friendRequests.indexOf(fr)
     reciever.friendRequests.splice(index,1)
     await reciever.save()// deleting req

   }
    
    return res.json({msg:"you both are now friends "})
  } catch (error) {
    console.log(error)
    return res.status(400).json({MSG:"ERRor"})
  }
}

exports.rejectRequest = async(req,res)=>{
  try {
    const{senderid, reciverid}= req.body
    const sender =await User.findById(senderid)
    const reciever =await User.findById(reciverid)
    const fr= reciever.friendRequests.map((req)=> req.id === sender._id)
    if(fr.length >0){
     const index = reciever.friendRequests.indexOf(fr)
     reciever.friendRequests.splice(index,1)
     await reciever.save()
     return res.json({msg:"you rejected friend request "})
    }
    return res.json({msg:"this user didnt send you req "})

  } catch (error) {
    console.log(error.message)
    return res.status(400).json({MSG:"ERRor"})
  }
}


exports.unFriend = async(req,res)=>{
  try {
    const{userid, tobeUnfriendId}= req.body
    const user =await User.findById(userid)
    const toBeUnfriend =await User.findById(tobeUnfriendId)
    const isFriend =user.friends.map((frnd)=> frnd._id === toBeUnfriend._id)
    if(isFriend.length>0){
      const index = user.friends.indexOf(isFriend)
      user.friends.splice(index,1)
      await user.save()
      return res.json({msg:"you unFriend this user "}) 
    }
    return res.json({msg:"user already not your friend"}) 
  } catch (error) {
    console.log(error.message)
    return res.status(400).json({MSG:"ERRor"})
  }
}

exports.getUsersMonth = async (req, res) => {
  try {
    const users = await User.find({});
    
    const currentMonth=new Date().getMonth()
    const currentYear=new Date().getFullYear()
    const monthUsers = users.filter((user) => {
      const userDate = new Date(user.time);
      return (
        userDate.getMonth() === currentMonth && // Month is 0-indexed
        userDate.getFullYear() === currentYear     //year of the month
      );
    });

    // // Map the users to include only the desired fields
    // const simplifiedUsers = monthUsers.map((user) => ({
    //   _id: user._id,
    //   name: user.name,
    //   email: user.email,
    //   password: user.password,
    //   phoneNo: user.phoneNo,
     
  
    //   coins: user.coins,
    //   gender: user.gender,
    //   country: user.country,
    //   relationship: user.relationship,
    //   googleId: user.googleId,
    //   googlePass: user.googlePass,
    //   facebookId: user.facebookId,
    //   facebookPass: user.facebookPass,
    //   twitterId: user.twitterId,
    //   twitterPass: user.twitterPass,
    //   profilePic: user.profilePic,
    //   coverPic: user.coverPic,
    //   coverPhoto: user.coverPhoto,
     
    //   time: user.time
    // }));

 return   res.json({msg:`users this month: ${monthUsers.length}`});
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ MSG: "Error" });
  }
};


exports.getBanUsersMonth = async (req, res) => {
  try {
    const users = await User.find({});
    
    const currentMonth=new Date().getMonth()
    const currentYear=new Date().getFullYear()
    const monthUsers = users.filter((user) => {
      const userDate = new Date(user.time);
      return (
        userDate.getMonth() === currentMonth && // Month is 0-indexed
        userDate.getFullYear() === currentYear  &&
        user.isBan=== true  
      );
    });

  res.json({msg:` ban users this month: ${monthUsers.length}`});
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ MSG: "Error" });
  }
};

exports.getVipUsersMonth = async (req, res) => {
  try {
    const users = await User.find({});
    
    const currentMonth=new Date().getMonth()
    const currentYear=new Date().getFullYear()
    const monthUsers = users.filter((user) => {
      const userDate = new Date(user.time);
      return (
        userDate.getMonth() === currentMonth && // Month is 0-indexed
        userDate.getFullYear() === currentYear  &&
        user.isVIP=== true  
      );
    });

  res.json({msg:` vip users this month: ${monthUsers.length}`});
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ MSG: "Error" });
  }
};


exports.gameCoinsGivenThisMonth= async(req,res)=>{
  try {
        const users = await User.find({});
    
    const currentMonth=new Date().getMonth()
    const currentYear=new Date().getFullYear()
    const monthUsers = users.filter((user) => {
      const userDate = new Date(user.time);
      return (
        userDate.getMonth() === currentMonth && // Month is 0-indexed
        userDate.getFullYear() === currentYear
      );
    });
    
   let monthCoins =0
   monthUsers.map((user)=>{
    user.transactions.map((trans)=>{
      if('card' in trans){//its game trans
        monthCoins+=trans.collectedCoins
      }})
      user.teenPattiTrans.map((trans)=>{
        monthCoins+=trans.collectedCoins
     })

   })
 
 return res.status(200).json(`coins won through this month are ${monthCoins}`)
   

  } catch (error) {
    res.json(error)
  }
}

exports.giftCoinsGivenThisMonth= async(req,res)=>{
try {
        const users = await User.find({});
    
    const currentMonth=new Date().getMonth()
    const currentYear=new Date().getFullYear()
    const monthUsers = users.filter((user) => {
      const userDate = new Date(user.time);
      return (
        userDate.getMonth() === currentMonth && // Month is 0-indexed
        userDate.getFullYear() === currentYear
      );
    });
    
   let monthCoins =0
   monthUsers.filter((user)=>{
      user.transactions.map(()=>{
        if(!('card' in trans)){
          monthCoins+=trans.collectedCoins
        }
      })
   })
// console.log(monthCoins)
 return res.status(200).json(`coins given through gift this month are ${monthCoins}`)
   

  } catch (error) {
    res.json(error)
  }
}

exports.getRechargeCoinsFromRewards= async(req,res)=>{
  try {
    const{userid,adminid}= req.body
        
     const user =await User.findById(userid)
     const admin =await User.findById(adminid)
    let rechargeCoins =0
     if(user.rewards.length >0){   //if user has something in rewards
       rechargeCoins+= (user.rewards.length)*500
       admin.rewards.push(...user.rewards)//give users reward to admin and empty users rewrd
       user.rewards=[]
     }
    if(user.myStore.length>0){
      rechargeCoins+=(user.myStore.length)*1000// if has store irems also.calculare coins againt items
      admin.myStore.push(...user.myStore)
      user.myStore=[]  //empty users store and push those irems to admin
    }
    if(rechargeCoins == 0){  // if no coins are made means both store reward empty
      res.json({msg:`you dont have any rewards or items in store.to get coins,try another methods`})
    }
    user.coins+=rechargeCoins//give coins to user otherwise and save record also
    const rechargeRecord={
      userid,
      rechargeCoinsTaken:rechargeCoins,
      rechargeTrans:"yes",
      rewardsTaken:user.rewards,
      storeItemsTaken:user.myStore,
      timestamp: new Date()
    }
    user.transactions.push(rechargeRecord)
    await user.save()

    admin.coin-=rechargeCoins  //deduct admin coins and save record what given what taken.save
    const arechargeRecord={
      userid,
      rechargeCoinsGiven:rechargeCoins,
      rechargeTrans:"yes",
      rewardsTaken:user.rewards,
      storeItemsTaken:user.myStore,
      timestamp: new Date()
    }
    admin.transactions.push(arechargeRecord)
    await admin.save()

     return res.json({msg:`you are awarded with ${rechargeCoins} coins in return to ur total rewards and store itmes`})
  } catch (error) {
    res.json(error)
  }
}

exports.totalRechargeCoinsGivenMonth=async(req,res)=>{
  try {
      const {adminid}=req.body
      const admin= await User.findById(adminid)
      if(!admin){
       return res.json({msg:`no  admin found`})
      }
      
      const users = await User.find({});
    
      const currentMonth=new Date().getMonth()
      const currentYear=new Date().getFullYear()
      const monthUsers = users.filter((user) => {
        const userDate = new Date(user.time);
        return (
          userDate.getMonth() === currentMonth && // Month is 0-indexed
          userDate.getFullYear() === currentYear
        );
      });
       
    let monthCoins=0

    monthUsers.map((user)=>{
      user.transactions.map((trans)=>{
        if('rechargeTrans' in trans){
          monthCoins+=trans.rechargeCoinsTaken
        }
      })
    })
 return res.json({msg:`total recharge coins given this month are ${monthCoins}`})
  } catch (error) {
    res.json(error)
    console.log(error)
  }
}

exports.getVerificationsThisMonth = async (req,res)=>{
  try {
          
    const users = await User.find({});
    
    const currentMonth=new Date().getMonth()
    const currentYear=new Date().getFullYear()
    const monthUsers = users.filter((user) => {
      const userDate = new Date(user.time);
      return (
        userDate.getMonth() === currentMonth && // Month is 0-indexed
        userDate.getFullYear() === currentYear
      );
    });
     
  let monthCount=0
  monthUsers.map((user)=>{
    monthCount+=user.verifyCount
  })
  return res.json({msg:`verifications this month are ${monthCount}`})
  } catch (error) {
    res.json(error)
    console.log(error)
  }
}

exports.getAdminsThisMonth=async(req,res)=>{
  try {
    const users = await User.find({});
    
    const currentMonth=new Date().getMonth()
    const currentYear=new Date().getFullYear()
    const monthUsers = users.filter((user) => {
      const userDate = new Date(user.time);
      return (
        userDate.getMonth() === currentMonth && // Month is 0-indexed
        userDate.getFullYear() === currentYear
      );
    });

  let adminCount=0
  monthUsers.map((user)=>{
     if(user.role=="admin"){
      adminCount+=1
     }
  })
   return res.status(200).json({msg:`admins created this month are: ${adminCount}`})
  } catch (error) {
    res.json(error)
    console.log(error)
  }
}

exports.friendSuggestion=async(req,res)=>{
  try {
    
    function mixAndMatchPosts(arr1, arr2,arr3,arr4) {
      const mixedPosts = [];
      const minLength = Math.min(arr1.length, arr2.length,arr3.length,arr4.length);
      
      for (let i = 0; i < minLength; i++) {
          mixedPosts.push(arr1[i]);
          mixedPosts.push(arr4[i])
          mixedPosts.push(arr2[i]);
          mixedPosts.push(arr3[i])
      }
    // If one array is longer than the other, add the remaining posts
      mixedPosts.push(...arr1.slice(minLength));
      mixedPosts.push(...arr3.slice(minLength))
      mixedPosts.push(...arr2.slice(minLength));
      mixedPosts.push(...arr4.slice(minLength))
      return mixedPosts;
  }
   function makeArraysDistinct(arr1, arr2, arr3, arr4) {
  // Combine all arrays into a single array
  const combinedArray = [...arr1, ...arr2, ...arr3, ...arr4];

  // Create a set to automatically remove duplicates
  const uniqueSet = new Set(combinedArray);
  const distinctArray = Array.from(uniqueSet);

  // Determine the number of elements to distribute evenly among the four arrays
  const numElementsPerArray = Math.floor(distinctArray.length / 4);
  const newArray1 = distinctArray.slice(0, numElementsPerArray);
  const newArray2 = distinctArray.slice(numElementsPerArray, 2 * numElementsPerArray);
  const newArray3 = distinctArray.slice(2 * numElementsPerArray, 3 * numElementsPerArray);
  const newArray4 = distinctArray.slice(3 * numElementsPerArray);

  return [newArray1, newArray2, newArray3, newArray4];
}
  const {userid} = req.body
    const user = await User.findById(userid)
    //friends of friends
    let fofs = new Set()
    const userFriends=user.friends
     for(const friend of userFriends ){
                                            //return his friends 
         const myFriend =await User.findById(friend._id)
         let fofss =myFriend.friends 
        for(const fof of fofss ){
        const FOF = await User.findById(fof._id)
        fofs.add(FOF)
        }
     }
     const arrayOfFriendsOfFriends = Array.from(fofs);

     //country people find
     let countrySet=new Set()
     const users = await User.find({})
      for(const countryUser of users){
        if(countryUser.country == user.country &&  !(user.friends.includes(countryUser))){
         countrySet.add(countryUser)
        }
      }
      const countryPeople= Array.from(fofs)

      //postsn people liked by me
      const posts = await Post.find({})
      let likedSet=new Set()
      for (const post of posts){

        const poste= await Post.findById(post._id)
        
        const postUser= await User.findById(poste.userid)
        const isLikedByMe = post.likes.map((like) => { like._id == user._id})
        if(isLikedByMe.length>0){
          likedSet.add(postUser)
        }
      }
      const likedUserArray= Array.from(likedSet)

    //post users on which i comment
    let commentSet= new Set()
    for (const post of posts){
      const postC = await Post.findById(post._id)
      const postUser= await User.findById(postC.userid)
      const isCommentedByMe =post.comments.map((comment) =>  comment.user._id == user._id)
      if(isCommentedByMe.length>0){
        commentSet.add(postUser)
      }
    }
    const commentUserArray = Array.from(commentSet)
  
  
    
    const  allArrays = makeArraysDistinct(arrayOfFriendsOfFriends,countryPeople,likedUserArray,commentUserArray);
    const fofSize =allArrays[0].length
    const shuffledFriendsOfFriends= allArrays[0].sort(()=> Math.random()-0.5)
    const CountryPeopleCount = allArrays[1].length
    const shuffledCountryPeople = allArrays[1].sort(()=>Math.random()-0.5)
    const likedPeopleCount = allArrays[2].length
    const shuffledPostUsers= allArrays[2].sort(()=> Math.random()-0.5 )
    const commentPeopleCount = allArrays[3].length
    const shuffledCPostUsers= allArrays[3].sort(()=> Math.random()-0.5 ) 

    const TotalArrayCount =fofSize+CountryPeopleCount+likedPeopleCount+commentPeopleCount
    const fofPer = Math.floor((40/TotalArrayCount)*100)
    const countryPer= Math.floor((30/TotalArrayCount)*100)
    const likePer = Math.floor((10/TotalArrayCount)*100)
    const commentPer = Math.floor((20/TotalArrayCount)*100)

    const friendsOfFriends= shuffledFriendsOfFriends.slice(0,fofPer)
    // console.log('fof',friendsOfFriends)//see friends of friends in suggestios
    const countryPeopleArray = shuffledCountryPeople.slice(0,countryPer)
    // console.log('country',countryPeopleArray)//see country users sugested
    const postUsers= shuffledPostUsers.slice(0,likePer)
    // console.log('postuser',postUsers)// sugestio of users i like their posts
    const commentUsers= shuffledCPostUsers.slice(0,commentPer)
    // console.log('commentusers',commentUsers) //users suggestred,which i left any comment to

    const friendSuggestions = mixAndMatchPosts(friendsOfFriends,countryPeopleArray,postUsers,commentUsers);
    return res.status(200).json(friendSuggestions)

}catch(error){
res.json(error)
console.log(error)}
}
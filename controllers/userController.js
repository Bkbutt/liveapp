const express=require('express')
const User = require('../models/userModel')
const passport = require('passport');
const crypto = require('crypto')
const twilio= require('twilio')
const bcrypt= require('bcrypt')
const jwt = require('jsonwebtoken')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

exports.Signup = async (req,res)=>{

    const {name,email,password,phoneNo,profilePic,coverPhoto,gender,country,relationship}=req.body;
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
        const authToken = 'd040bfcca12c07d45d4c44bfa0f27add';
        const client = twilio(accountSid, authToken);
        client.messages.create({
          body: `Your App OTP is ${otp} and hash: ${hash}.${expires}`,
          from: +923204833506, // Twilio phone number
          to: phoneNo // Recipient's phone number
         })
        .then(message => console.log('Message sent:', message.sid))
        .catch(error => console.error('Error:', error));


            const hashed =await bcrypt.hash(password,10);
            const user =new User({name,email,password:hashed,phoneNo,profilePic,coverPhoto,gender,country,relationship});
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

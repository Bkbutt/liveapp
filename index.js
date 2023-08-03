const express =require('express');
const app = express();
require('dotenv').config({path:'./.env'});
const db= require('./db/conn')
db();
const { chatSocket } = require('socket.io');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const connectedUsers = {}; // Initialize an empty object to store connected users

// ... (Other configurations)

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // Handle user registration and add to 'connectedUsers'
  socket.on('registerUser', ({ userid }) => {
    connectedUsers[userid] = socket; // Store the socket connection using the user ID
    console.log('User registered:', userid);
  });

  // Handle user disconnection and remove from 'connectedUsers'
  socket.on('disconnect', () => {
    // Find and remove the user from 'connectedUsers'
    for (const [userid, socketInstance] of Object.entries(connectedUsers)) {
      if (socketInstance === socket) {
        delete connectedUsers[userid];
        console.log('User disconnected:', userid);
        break;
      }
    }
  });
}); 

const session = require('express-session');
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 7000 || process.env.PORT;
const User = require('./models/userModel')

// Add these requires at the top of your `server.js` file
const passport = require('passport');
// Initialize Passport and restore authentication state, if any
app.use(passport.initialize());
app.use(passport.session());
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

// Google Strategy configuration
passport.use(new GoogleStrategy({
    clientID: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: '/auth/google/callback',
  }, (accessToken, refreshToken, profile, done) => {
    // Handle Google authentication logic here
    // Access token can be used to make requests to Google APIs on behalf of the user
    // Profile contains the user's information returned by Google
  
    // Example: Save user information to the database
    User.findOne({ googleId: profile.id })
      .then((existingUser) => {
        if (existingUser) {
          // User already exists in the database
          done(null, existingUser);
        } else {
          // Create a new user in the database
          const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
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

// Facebook Strategy configuration
passport.use(new FacebookStrategy({
  clientID: 'YOUR_FACEBOOK_APP_ID',
  clientSecret: 'YOUR_FACEBOOK_APP_SECRET',
  callbackURL: '/auth/facebook/callback',
}, (accessToken, refreshToken, profile, done) => {
  // Handle Facebook authentication logic here
  // You can save the user's information in the database or perform any other necessary actions
  // Example: Save user information to the database
  User.findOne({ googleId: profile.id })
  .then((existingUser) => {
    if (existingUser) {
      // User already exists in the database
      done(null, existingUser);
    } else {
      // Create a new user in the database
      const newUser = new User({
        facebookId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
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

const TwitterStrategy = require('passport-twitter').Strategy;

passport.use(new TwitterStrategy({
  consumerKey: 'YOUR_TWITTER_CONSUMER_KEY',
  consumerSecret: 'YOUR_TWITTER_CONSUMER_SECRET',
  callbackURL: '/auth/twitter/callback',
}, (token, tokenSecret, profile, done) => {
  // Handle Twitter authentication logic here
  // Access token and token secret can be used to make requests to Twitter APIs on behalf of the user
  // Profile contains the user's information returned by Twitter

  // Example: Save user information to the database
  User.findOne({ twitterId: profile.id })
    .then((existingUser) => {
      if (existingUser) {
        // User already exists in the database
        done(null, existingUser);
      } else {
        // Create a new user in the database
        const newUser = new User({
          twitterId: profile.id,
          name: profile.displayName,
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
// twitter authentication and callback route
app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/profile',
  failureRedirect: '/login',
}));

// Google authentication route
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google authentication callback route
app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/profile',
  failureRedirect: '/login',
}));

// Facebook authentication route
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook authentication callback route
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/profile',
  failureRedirect: '/login',
}));




const user= require('./routes/user')
app.use('/',user)
const vip= require('./routes/vip')
app.use('/',vip)
const game = require('./routes/games')
app.use('/',game)
const post= require('./routes/posts')
app.use('/',post)
const video = require('./routes/video')
app.use('/',video)
const audio = require('./routes/audio')
app.use('/',audio)
const ad = require('./routes/ad')
app.use('/',ad)
const gameStore = require('./routes/gameStore')
app.use('/',gameStore)
const levels = require('./routes/levels')
app.use('/',levels)
const eStore = require('./routes/eStore')
app.use('/',eStore)


app.listen(port, (err) => {
    if (err) console.log(err);
    console.log(`Server running at http://localhost:${port}`);
})
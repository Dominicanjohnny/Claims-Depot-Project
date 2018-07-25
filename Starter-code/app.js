require('dotenv').config();

const LocalStrategy = require('passport-local').Strategy;
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt       = require('bcrypt');
const passport     = require('passport');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');


mongoose.Promise = Promise;
mongoose
  .connect('mongodb://localhost/claims-depot-project', {useMongoClient: true})
  .then(() => {
    console.log('Connected to Mongo!');
  }).catch(err => {
    console.error('Error connecting to mongo', err);
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// app.configure(function() {
  
//   app.use(express.session({ secret: 'your secret key' }));
//   // Make sure this comes after the express session   
//   app.use(passport.initialize());
//   app.use(passport.session());
  
// });
// NEW
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

// Signing Up
passport.use('local-signup', new LocalStrategy(
  { passReqToCallback: true },
  (req, username, password, next) => {
    // To avoid race conditions
    process.nextTick(() => {
        User.findOne({
            'username': username
        }, (err, user) => {
            if (err){ return next(err); }

            if (user) {
                return next(null, false);
            } else {
                // Destructure the body
                const { username, email, description, insurance, password } = req.body;
                const hashPass = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
                const newUser = new User({
                  username,
                  email,
                  description,
                  insurance,
                  password: hashPass
                });

                newUser.save((err) => {
                    if (err){ next(err); }
                    return next(null, newUser);
                });
            }
        });
    });
}));

passport.use('local-login', new LocalStrategy((username, password, next) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, { message: "Incorrect username" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "Incorrect password" });
    }

    return next(null, user);
  });
}));

app.use(passport.initialize());
app.use(passport.session());


app.use( (req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
  }
  next();
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use( (req, res, next) => {
  if (typeof(req.user) !== "undefined"){
    res.locals.userSignedIn = true;
  } else {
    res.locals.userSignedIn = false;
  }
  next();
});

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

app.listen(3000, function () {
  console.log('Listening on http://localhost:3000/');
});

// default value for title local
app.locals.title = 'Claims-Depot';



const index = require('./routes/index');
app.use('/', index);


module.exports = app;

var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
const Users = require('./models/users');

exports.local = passport.use(new localStrategy(Users.authenticate()));
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

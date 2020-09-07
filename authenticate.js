var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
const Users = require('./models/users');
var JwtStrategy= require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var FacebookTokenStrategy = require('passport-facebook-token');
const config = require('./config');



exports.local = passport.use(new localStrategy(Users.authenticate()));
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

exports.getToken = function(user){
    return jwt.sign(user, config.secretKey,{
        expiresIn: 3600
    });
}

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done)=>{
    console.log(jwt_payload);
    Users.findOne({_id: jwt_payload._id}, (err, user)=>{
        if(err){
            return done(err, false);
        }else if(user){
            return done(null, user);
        }else{
            return done(null, false);
        }
    })
}));

exports.verifyUser = passport.authenticate('jwt',{session: false});


exports.isAdmin = (req, res, next)=>{
    if(req.user.admin){
        next();
    }else{
        var err = new Error('You are not authorized for this operation');
        err.status = 403;
        next(err);
    }
};

exports.facebookPassport= passport.use(
    new FacebookTokenStrategy({
        clientID: config.facebook.clientId,
        clientSecret: config.facebook.clientSecret
    }, (accessToken, refreshToken, profile, done)=>{
        Users.findOne({facebookId: profile.id}, (err, user)=>{
            if(err){
                return done(err, false);
            }
            else if(!err && user !== null){
                return done(null, user);
            }
            else{
                user = new Users({
                    username: profile.displayName,
                });
                user.facebookId = profile.id;
                user.firstName = profile.name.givenName;
                user.lastName = profile.name.familyName;
                user.save((err, user)=>{
                    if(err){
                        done(err, false);
                    }else{
                        done(null, user);
                    }
                });
            }
        });
    }
));
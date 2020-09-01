var express = require('express');
const Users = require('../models/users');
var passport = require('passport');
var router = express.Router();
const authenticate = require('../authenticate');

/* GET users listing. */
router.get('/', authenticate.verifyUser, authenticate.isAdmin, function(req, res, next) {
  Users.find({})
    .then((users)=>{
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(users);
    },(err)=>next(err))
    .catch((err)=>next(err));
});


/**
 * SIGN UP
 */
router.post('/signup', (req, res, next)=>{
  Users.register(new Users({username:req.body.username}), req.body.password, (err, user)=>{
      if(err){
        res.statusCode = 500;
        res.setHeader('Content-type', 'application/json');
        res.json({err: err});
      }else{
        if (req.body.firstName)
          user.firstName = req.body.firstName
        if (req.body.lastName)
          user.lastName = req.body.lastName
        user.save((err, user)=>{
          if(err){
            res.statusCode = 500;
            res.setHeader('Content-type', 'application/json');
            res.json({err: err});
          }
          passport.authenticate(`local`)(req, res, ()=>{
            res.statusCode = 200;
            res.setHeader('Content-type', 'application/json');
            res.json({status:'registration successful', success: true});
          });
        })
        
      }
    });
});


router.post('/login', passport.authenticate('local'), (req, res)=>{
  var token = authenticate.getToken({_id : req.user._id})
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.json({status:'You are successfully logged in', token: token, success: true});
});

/**
 *  LOG OUT
 */

router.get('/logout', (req, res, next)=>{
  if(req.session){
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }else{
    var err = new Error('You are not logged in');
    err.status = 403;
    next(err);
  }
}); 


module.exports = router;

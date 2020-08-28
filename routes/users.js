var express = require('express');
const Users = require('../models/users');
var passport = require('passport');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
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
        passport.authenticate(`local`)(req, res, ()=>{
          res.statusCode = 200;
          res.setHeader('Content-type', 'application/json');
          res.json({status:'registration successful', success: true});
        });
      }
    });
});


router.post('/login', passport.authenticate('local'), (req, res)=>{
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.json({status:'You are successfully logged in', success: true});
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

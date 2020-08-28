var express = require('express');
const Users = require('../models/users');
const { Router } = require('express');

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


/**
 * SIGN UP
 */
router.post('/signup', (req, res, next)=>{
  Users.findOne({username:req.body.username})
    .then( (user)=> {
      if(user!=null){
        var err = new Error(`${req.body.username} already exists`);
        err.status = 403;
        next(err);
      }else{
        return Users.create({
          username: req.body.username,
          password: req.body.password
        });
      }
    })
    .then((user)=>{
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json({status:'registration successful', user: user});
    }, (err)=> next(err))
    .catch((err)=>next(err));
});


router.post('/login', (req, res, next)=>{

  if(!req.session.user){
    var authHeader = req.headers.authorization;
    if(!authHeader){
      var err = new Error(`You aren't authenticated`);
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      next(err);
      return;
    }

    var auth = new Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':');
    var username = auth[0];
    var password = auth[1];
    Users.findOne({username: username})
      .then((user)=>{
        if(user===null){
          var err = new Error(`User ${user.username} does not exist`);
          res.setHeader('WWW-Authenticate', 'Basic');
          err.status = 401;
          next(err);
        }else if(password!=user.password){
          var err = new Error(`Username or Password is incorrect`);
          res.setHeader('WWW-Authenticate', 'Basic');
          err.status = 401;
          next(err);
        }else if(password==user.password){
          req.session.user = 'authenticated';
          res.statusCode = 200;
          res.setHeader('Content-Type','text/plain');
          res.end('You are authenticated!');
        }
      })
      .catch((err)=> next(err));
    
  }else{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated');
  }
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

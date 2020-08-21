const express = require('express');
const bodyParser = require('body-parser');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
    .all((req,res,next)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','text/html');
        res.setHeader('Test','this should be in everything');
        next();
    })
    .get((req, res, next)=>{
        res.end("We'll send all promotions");
    })
    .post((req,res,next)=>{
        res.end('Will add the promotions /promotions');
    })
    .put((req,res,next)=>{
        res.end("PUT operation supported on /promotions");
    })
    .delete((req,res,next)=>{
        res.end("Deleting all promotions on /promotions");
    });

leaderRouter.route('/:leaderId')
    .all((req,res,next)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','text/html');
        res.setHeader('Test','this should be in everything');
        next();
    })
    .get((req, res, next)=>{
        res.end(`We'll send details of the leader: ${req.params.leaderId} to you`);
    })
    .post((req,res,next)=>{
        res.end(`POST operation supported on /leaders/${req.params.leaderId}`);
    })
    .put((req,res,next)=>{
        res.write(`Updating the leader: ${req.params.leaderId} \n`);
        res.end(`Will update the leader: ${req.body.name} with details: ${req.body.description}`);
    })
    .delete((req,res,next)=>{
        res.end(`Deleting leader: ${req.params.leaderId}`);
    });

module.exports = leaderRouter;
const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
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

promoRouter.route('/:promoId')
    .all((req,res,next)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','text/html');
        res.setHeader('Test','this should be in everything');
        next();
    })
    .get((req, res, next)=>{
        res.end(`We'll send details of the promotion: ${req.params.promoId} to you`);
    })
    .post((req,res,next)=>{
        res.end(`POST operation supported on /promotions/${req.params.promoId}`);
    })
    .put((req,res,next)=>{
        res.write(`Updating the leader: ${req.params.promoId} \n`);
        res.end(`Will update the promotion: ${req.body.name} with details: ${req.body.description}`);
    })
    .delete((req,res,next)=>{
        res.end(`Deleting promotions: ${req.params.promoId}`);
    });

module.exports = promoRouter;
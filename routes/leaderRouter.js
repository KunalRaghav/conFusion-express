const express = require('express');
const Leaders = require('../models/leaders');
const authenticate = require('../authenticate');
const cors = require('./cors');

const leaderRouter = express.Router();

leaderRouter.use(express.json());

leaderRouter.route('/')
    .options(cors.corsWithOptions, (req, res)=> {res.sendStatus(200);})
    .get(cors.cors, (req, res, next)=>{
        Leaders.find(req.query)
            .then((leaders)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(leaders);
            },(err) => next(err))
            .catch((err)=> next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.isAdmin, (req,res,next)=>{
        Leaders.create(req.body)
            .then((leader)=>{
                console.log('leader created');
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(leader);
            }, (err) => next(err))
            .catch((err)=> next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.isAdmin, (req,res,next)=>{
        res.end("PUT operation supported on /promotions");
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.isAdmin, (req,res,next)=>{
        Leaders.remove({})
        .then((resp)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err)=> next(err));
    });

leaderRouter.route('/:leaderId')
    .options(cors.corsWithOptions, (req, res)=> {res.sendStatus(200);})
    .get(cors.cors, (req, res, next)=>{
        Leaders.findById(req.params.leaderId)
        .then((leader)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(leader);
        }, (err) => next(err))
        .catch((err)=> next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.isAdmin, (req,res,next)=>{
        res.end(`POST operation supported on /leaders/${req.params.leaderId}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.isAdmin, (req,res,next)=>{
        Leaders.findByIdAndUpdate(req.params.leaderId, {
            $set: req.body
        },{ new: true})
        .then((leader)=>{
            console.log('leader updated');
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(leader);
        }, (err) => next(err))
        .catch((err)=> next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.isAdmin, (req,res,next)=>{
        Leaders.findByIdAndRemove(req.params.leaderId)
            .then((resp)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err)=> next(err));
    });

module.exports = leaderRouter;
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Dishes = require('../models/dishes');
const authenticate = require('../authenticate');
const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
    .get((req, res, next)=>{
        Dishes.find({})
            .populate('comments.author')
            .then((dishes)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(dishes);
            }, (err) => next(err))
            .catch((err)=> next(err));
    })
    .post(authenticate.verifyUser, authenticate.isAdmin, (req,res,next)=>{
        Dishes.create(req.body)
            .then((dish)=>{
                console.log('dish created');
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err)=> next(err));
    })
    .put(authenticate.verifyUser, authenticate.isAdmin, (req,res,next)=>{
        res.statusCode = 403;
        res.end("PUT operation not supported on /dishes");
    })
    .delete(authenticate.verifyUser, authenticate.isAdmin, (req,res,next)=>{
        Dishes.remove({})
            .then((resp)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err)=> next(err));
    });


dishRouter.route("/:dishId")
    .get((req, res, next)=>{
        Dishes.findById(req.params.dishId)
        .populate('comments.author')
        .then((dish)=>{
            console.log('dish created');
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(dish);
        }, (err) => next(err))
        .catch((err)=> next(err));
    })
    .post(authenticate.verifyUser, authenticate.isAdmin, (req,res,next)=>{
        res.statusCode = 403;
        res.end(`POST operation not supported on /dishes/${req.params.dishId}`);
    })
    .put(authenticate.verifyUser, authenticate.isAdmin, (req,res,next)=>{
        Dishes.findByIdAndUpdate(req.params.dishId, {
            $set: req.body
        },{ new: true})
        .then((dish)=>{
            console.log('dish created');
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(dish);
        }, (err) => next(err))
        .catch((err)=> next(err));
    })
    .delete(authenticate.verifyUser, authenticate.isAdmin, (req,res,next)=>{
        Dishes.findByIdAndRemove(req.params.dishId)
            .then((resp)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err)=> next(err));
    });


dishRouter.route('/:dishId/comments')
    .get((req, res, next)=>{
        Dishes.findById(req.params.dishId)
            .then((dish)=>{
                if(dish!=null){
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(dish.comments);
                }else{
                    err = new Error(`Dish ${req.params.dishId} not found`);
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err)=> next(err));
    })
    .post(authenticate.verifyUser, (req,res,next)=>{
        Dishes.findById(req.params.dishId)
            .then((dish)=>{
                if(dish!=null){
                    req.body.author = req.user._id;
                    dish.comments.push(req.body);
                    dish.save()
                        .then((dish)=>{
                            Dishes.findById(dish._id)
                                .populate('comments.author')
                                .then((dish)=>{
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type','application/json');
                                    res.json(dish);
                                }); 
                        }, (err)=> next(err));
                }else{
                    err = new Error(`Dish ${req.params.dishId} not found`);
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err)=> next(err));
    })
    .put(authenticate.verifyUser, (req,res,next)=>{
        res.statusCode = 403;
        res.end("PUT operation not supported on /dishes/ "+req.params.dishId+"/comments");
    })
    .delete(authenticate.verifyUser, authenticate.isAdmin, (req,res,next)=>{
        Dishes.findById(req.params.dishId)
            .then((dish)=>{
                if(dish!=null){
                    for( var i = (dish.comments.length -1); i >= 0; i--){
                        dish.comments.id(dish.comments[i]._id).remove();
                    }
                    dish.save()
                        .then((dish)=>{
                            res.statusCode = 200;
                            res.setHeader('Content-Type','application/json');
                            res.json(dish);
                        })
                }else{
                    err = new Error(`Dish ${req.params.dishId} not found`);
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err)=> next(err));
    });


dishRouter.route("/:dishId/comments/:commentId")
    .get((req, res, next)=>{
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish)=>{
                if(dish!=null && dish.comments.id(req.params.commentId)!=null){
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(dish.comments.id(req.params.commentId));
                }else if(dish==null){
                    err = new Error(`Dish ${req.params.dishId} not found`);
                    err.status = 404;
                    return next(err);
                }else{
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err)=> next(err));
    })
    .post(authenticate.verifyUser, (req,res,next)=>{
        res.statusCode = 403;
        res.end(`POST operation not supported on /dishes/${req.params.dishId}/comments/${req.params.commentId}`);
    })
    .put(authenticate.verifyUser, (req,res,next)=>{
        Dishes.findById(req.params.dishId)
            .then((dish)=>{
                // console.log(`Userid: ${req.user.id} \nAuthId: ${dish.comments.id(req.params.commentId).author}`);
                if(dish!=null && dish.comments.id(req.params.commentId)!=null && dish.comments.id(req.params.commentId).author===req.user.id){
                    if(req.body.rating!=null){
                        dish.comments.id(req.params.commentId).rating = req.body.rating;
                    }
                    if(req.body.comment!=null){
                        dish.comments.id(req.params.commentId).comment = req.body.comment;
                    }
                    dish.save()
                        .then((dish)=>{
                            Dishes.findById(dish._id)
                            .populate('comments.author')
                            .then((dish)=>{
                                res.statusCode = 200;
                                res.setHeader('Content-Type','application/json');
                                res.json(dish);
                            });  
                        }, (err)=>next(err));
                    
                }else if(dish==null){
                    err = new Error(`Dish ${req.params.dishId} not found`);
                    err.status = 404;
                    return next(err);
                }else if(dish.comments.id(req.params.commentId)==null){
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }else{
                    err = new Error(`You aren't authorized to modify this comment`);
                    err.status = 403;
                    return next(err); 
                }
            }, (err) => next(err))
            .catch((err)=> next(err));
    })
    .delete(authenticate.verifyUser, (req,res,next)=>{
        Dishes.findById(req.params.dishId)
            .then((dish)=>{
                if(dish!=null && dish.comments.id(req.params.commentId) != null && dish.comments.id(req.params.commentId).author===req.user.id){
                    for( var i = (dish.comments.length -1); i >= 0; i--){
                        if(dish.comments[i]._id == req.params.commentId){
                            dish.comments.id(dish.comments[i]._id).remove();
                            break;
                        }
                    }
                    dish.save()
                        .then((dish)=>{
                            Dishes.findById(dish._id)
                            .populate('comments.author')
                            .then((dish)=>{
                                res.statusCode = 200;
                                res.setHeader('Content-Type','application/json');
                                res.json(dish);
                            });  
                        }, (err)=>next(err));
                }else if(dish==null){
                    err = new Error(`Dish ${req.params.dishId} not found`);
                    err.status = 404;
                    return next(err);
                }else if(dish.comments.id(req.params.commentId)==null){
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }else{
                    err = new Error(`You aren't authorized to delete this comment`);
                    err.status = 403;
                    return next(err); 
                }
            }, (err) => next(err))
            .catch((err)=> next(err));
    });

module.exports = dishRouter;
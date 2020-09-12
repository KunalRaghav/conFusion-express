const express = require('express');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favourites = require('../models/favourites');

const favouritesRouter = express.Router();

favouritesRouter.use(express.json());

favouritesRouter.route('/')
    .options(cors.corsWithOptions, (req, res)=> {res.sendStatus(200);})
    .get(cors.cors, authenticate.verifyUser, (req, res, next)=>{
        Favourites.findOne({"user":`${req.user._id}`})
            .populate('dishes')
            .populate('user')
            .then((favourites)=>{
                if(favourites!=null){
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(favourites);
                }else{
                    res.statusCode = 403;
                    var err = new Error('No Dishes set as favourite.');
                    next(err);   
                }
            }, (err) => next(err))
            .catch((err)=> next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
        var dishesList = req.body;
        console.log('Help 0');
        Favourites.findOne({"user":`${req.user._id}`})
            .then((favourites)=>{
                console.log('Help 1');
                if(favourites!=null){
                    var updatedFavourites = false;
                    for(var i = 0; i < dishesList.length; i++ ){
                        console.log(`help 3 ${i}`)
                        var isAlreadyPresent = favourites.dishes.some((dish)=>{
                            return dish.equals(dishesList[i]._id);  
                        })
                        if(!isAlreadyPresent){
                            favourites.dishes.push(dishesList[i]._id);
                            updatedFavourites = true;
                        }
                    }
                        
                    if(updatedFavourites){
                        favourites.save()
                            .then((favourites)=>{
                                res.statusCode = 200;
                                res.setHeader('Content-Type','application/json');
                                res.json(favourites);
                            }, (err)=> next(err));
                    }else{
                        res.statusCode = 200;
                        res.end('Favourites already upto date.');
                    }
                }else{
                    Favourites.create({"user": `${req.user._id}`})
                        .then((favourites)=>{
                            for(var i = 0; i < dishesList.length; i++ ){
                                console.log(`Dish ${i} id: ${dishesList[1]._id}`);
                                var isAlreadyPresent = favourites.dishes.some((dish)=>{
                                    return dish.equals(dishesList[i]._id);  
                                })
                                if(!isAlreadyPresent){
                                    favourites.dishes.push(dishesList[i]._id);
                                }
                            }
                            favourites.save()
                                .then((favourites)=>{
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type','application/json');
                                    res.json(favourites);
                                }, (err)=> next(err));
                        }, (err)=> next(err))
                        .catch((err)=>next(err));
                }

            }, (err) => next(err))
            .catch((err)=>next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res)=>{
        res.statusCode = 403;
        res.end('Put operation not supported on /favourites/'+req.params.dishId);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourites.deleteOne({"user":`${req.user._id}`})
            .then((result)=> {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(result);
            }, (err)=>next(err))
            .catch((err)=>next(err));
    })

favouritesRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res)=> {res.sendStatus(200);})
    .get(cors.corsWithOptions, (req, res)=>{
        res.statusCode = 403;
        res.end('Get operation not supported on /favourites/'+req.params.dishId);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
        var id = req.user._id;
        var dishId = req.params.dishId;
        Favourites.findOne({"user":`${req.user._id}`})
            .then((favourites)=>{
                if(favourites!=null){
                    var dishExists = false;
                    for(var i = 0; i < favourites.dishes.length - 1 ; i++){
                        if(favourites.dishes[i]==dishId){
                            dishExists = true;
                            break;
                        }
                    }
                    if(!dishExists){
                        favourites.dishes.push(req.params.dishId);
                        favourites.save()
                        .then((favourites)=>{
                            res.statusCode = 200;
                            res.setHeader('Content-Type','application/json');
                            res.json(favourites);
                        }, (err)=> next(err))
                    }else{
                        var err = new Error('Dish already set as favourite');
                        next(err);
                        return;
                    }
                    
                }else if(favourites==null){
                    Favourites.create({"user": `${id}`})
                        .then((favourite)=>{
                            favourite.dishes.push(dishId);
                            favourite.save()
                                .then((favourite)=>{
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type','application/json');
                                    res.json(favourite);
                                }, (err) => next(err) )
                                .catch((err)=> next(err));
                        }, (err)=> next(err))
                        .catch((err)=>next(err));
                }
            })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res)=>{
        res.statusCode = 403;
        res.end('Put operation not supported on /favourites/'+req.params.dishId);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
        var dishId = req.params.dishId;
        Favourites.findOne({"user":`${req.user._id}`})
            .then((favourites)=>{
                if(favourites!=null){
                    var dishDeleted = false;
                    for(var i = 0; i < favourites.dishes.length ; i++){
                        console.log(`DishNumber ${i+1} : ${favourites.dishes[i]}`);
                        if(favourites.dishes[i].equals(dishId)){
                            favourites.dishes.pull(dishId);
                            dishDeleted = true
                            break;
                        }
                    }
                    console.log(`Dish Deleted:  ${dishDeleted}`)
                    favourites.save()
                        .then((favourites)=>{
                            if(dishDeleted){
                                res.statusCode = 200;
                                res.setHeader('Content-Type','application/json');
                                res.json(favourites);
                            }else{
                                var err = new Error('Dish not present as favourite');
                                next(err);
                                return;
                            }
                        }, (err)=> next(err))
                        .catch((err)=>next(err));
                    
                    
                }else if(favourites==null){
                    var err = new Error('No Dish is present as favourite');
                    next(err);
                    return;
                }
            })
    })


module.exports = favouritesRouter;  
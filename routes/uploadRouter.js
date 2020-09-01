const express = require('express');
const mongoose = require('mongoose');
const Dishes = require('../models/dishes');
const authenticate = require('../authenticate');
const uploadRouter = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb)=> {
        cb(null, 'public/images');
    },

    filename: (req, file, cb)=>{
        cb(null, file.originalname);
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
        err = new Error('You can upload only image files');
        return cb(err, false);
    }
    cb(null, true);
}

const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter
});

uploadRouter.use(express.json());

uploadRouter.route('/')
    .get(authenticate.verifyUser, authenticate.isAdmin, (req,res,next)=>{
        res.statusCode = 403;
        res.end("GET operation not supported on /imageUpload");
    })
    .put(authenticate.verifyUser, authenticate.isAdmin, (req,res,next)=>{
        res.statusCode = 403;
        res.end("PUT operation not supported on /imageUpload");
    })
    .delete(authenticate.verifyUser, authenticate.isAdmin, (req,res,next)=>{
        res.statusCode = 403;
        res.end("DELETE operation not supported on /imageUpload");
    })
    .post(authenticate.verifyUser, authenticate.isAdmin, 
        upload.single('imageFile'), (req, res)=>{
            res.statusCode = 200;
            res.setHeader("Content-Type","application/json");
            res.json(req.file);
        }
    );

module.exports = uploadRouter;
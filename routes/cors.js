const express = require('express');
const cors = require('cors');

const app = express();

const whitelist = ['https://localhost:3000', 'https://localhost:3443'];

var corsOptionsDelegate = (req, callback) => {
    var corsOptions;

    if(whitelist.indexOf(req.header('Origin')) !== -1){
        corsOptions = { origin : true };
    }
    else{
        corsOptions = { origin : false };
    }

    callback(null, corsOptions);
}

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
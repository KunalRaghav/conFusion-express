var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
    username: {
        type: String,
        required:true,
        unique:true
    },
    password:{
        type: String,
        required:true
    },
    admin:{
        type: Boolean,
        default: false
    }
});

var Users = mongoose.model('User', UserSchema);

module.exports = Users; 
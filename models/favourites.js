const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const favouriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dishes : [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Dish'
    }]
},{
    timestamps: true
})

var Favourites = mongoose.model('Favourites', favouriteSchema);

module.exports = Favourites;
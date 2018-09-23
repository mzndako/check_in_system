
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bashSchema = new Schema({
    email: { type: String, required: true, unique: true }, // Make email unique and required
    card_number: String,
    pin: String,
    total_points: Number,
    points: Number,
    balance: Number
});



module.exports = mongoose.model('userDB', bashSchema);


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bashSchema = new Schema({
    email: { type: String, required: true, unique: true }, // Make email unique and required
    card_number:  { type: String, required: true, unique: true },
    pin: String,
    total_points: {type: Number, default: 0},
    points: {type: Number, default: 0}
});



module.exports = mongoose.model('account', bashSchema);

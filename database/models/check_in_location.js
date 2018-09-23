
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var check_in_schema = new Schema({
    name: { type: String, required: true }, // Make email unique and required
    address: { type: String, required: true }, // Make email unique and required
    longitude: String,
    latitude: String,
    authorization_token: String
});



module.exports = mongoose.model('locations', check_in_schema);

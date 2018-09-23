
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bashSchema = new Schema({
    username: { type: String, required: true, unique: true }, // Make email unique and required
    email: { type: String, required: true, unique: true }, // Make email unique and required
    password: String,
    last_login: { type: Date, default: Date.now }
});



module.exports = mongoose.model('admin', bashSchema);

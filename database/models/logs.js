
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var logs_schema = new Schema({
    email: { type: String, required: true }, // required
    location_Id: String,
    address: String,
    points: Number,
    date: {type: Date, default: Date.now}
});



module.exports = mongoose.model('logs', logs_schema);


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bashSchema = new Schema({
    email: { type: String, required: true, unique: true }, // Make email unique and required
    first_name: String,
    last_name: String,
    home_address:
    {
        address: "",
        longitude: "",
        latitude: "" 
    },
    office_address: {
        address: "",
        longitude: "",
        latitude: ""
    },
    last_location: {
        address: "",
        longitude: "",
        latitude: ""
    }
});



module.exports = mongoose.model('userDB', bashSchema);

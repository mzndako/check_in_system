const express       = require("express");
const app           = express();
const server        = require("http").createServer(app);

const body_parser   = require("body-parser");
const mongoose      = require("mongoose");
const admin_db      = require("./database/models/admin");
const auth_function = require("./functions/auth");

// const passport      = require("passport");
const config        = require("./config/config")
const config_db     = require("./database/config/database");

// const passportJWT   = require("passport-jwt");


// Use the body parse to parse the upload data as object
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());

// Get the swagger renderere
const swagger_ui     = require('swagger-ui-express');
// Import the prepared documentation in swagger
const swagger_doc   = require('./swagger.json');

app.use('/api-docs', swagger_ui.serve, swagger_ui.setup(swagger_doc));

app.use('/api/v1/' , require('./routes/index'));

// Establish the database connection
mongoose.connect(config_db.database,{ useNewUrlParser: true }, function(err) {
    if (err) {
        // console.log('database connection error', err);
    } else {
        // console.log('Database Connection Successful');
    }
});

// Setup Admin default username and password if not already set
admin_db.findOne({username: config.default_admin_username.toLowerCase()}, (err, admin)=>{
    // If admin not found, create it
    if(!admin){
        admin_db.create({
            username: config.default_admin_username.toLowerCase(),
            password: auth_function.encrypt_password(config.default_admin_password),
            email: config.default_admin_email
        }, (err, success)=> {console.log(err);});
    }
});

// console.log("listening on PORT "+ config.port);
server.listen(config.port);

module.exports = app;
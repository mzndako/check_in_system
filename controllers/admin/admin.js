const admin_db = require("./../../database/models/admin");
const check_in_location_db = require("./../../database/models/check_in_location");
const merchant_db = require("./../../database/models/merchant");
const auth_function = require("./../../functions/auth");
const config = require("./../../config/config");
const jwt = require('jsonwebtoken');

module.exports = {
    login: (req, res) => {
        // Collect the submitted username and password
        let username = req.body.username;
        let password = req.body.password;

        if (!username || !password) {
            return res.status(401).send({ status: false, message: "Please provide a valid username or password" });
        }

        // Search for the username in the admin database
        admin_db.findOne({ username: username.toLowerCase() }, (err, admin) => {
            if (!admin) {
                return res.status(401).send({ status: false, message: "Invalid Username or Password" });
            }

            auth_function.verify_password(password, admin.password, (status) => {
                if (!status) {
                    return res.status(401).send({ status: false, message: "Invalid Username or Password" });
                }
                let payload = {
                    username: admin.username,
                    email: admin.email
                };
                var token = jwt.sign(payload, config.jwt_secret_key, {
                    expiresIn: 3600 // Expires in 1 hour
                });
                res.send({ status: true, token: token });
            });


        })

    },

    // POST /api/v1/admin/check_in_location
    // Create check in location using admin previleges
    check_in_location: (req, res) => {
        // Collect the post parameters
        let name = req.body.name;
        let address = req.body.address;
        let longitude = req.body.longitude;
        let latitude = req.body.latitude;
        let token = auth_function.generate_token();

        if(!longitude || !latitude){
            return res.failed("Please provide a valid longitude and latitute");
        }

        if(!name || !address){
            return res.failed("Name or Address can not be empty");
        }

        // Create the check in location
        check_in_location_db.create({
            name: name,
            address: address,
            longitude: longitude,
            latitude: latitude,
            authorization_token: token
        }, (err, update) => {
            // Return the token for the check in location
            res.success({ name: name, token: token });
        });

    },

    // GET /api/v1/admin/check_in_location
    // Get all check in location
    get_locations: (req, res) => {
        check_in_location_db.find({}, (err, locations) => {
            res.success(locations);
        });
    },

    // DELETE /api/v1/admin/check_in_location/:location_Id
    // Delete a specific check in location
    delete_location: (req, res) => {
        let id = req.params.location_Id;

        check_in_location_db.remove({ _id: id }, (err, status) => {
            res.success(undefined, "Successfully Deleted");
        });
    },

    // POST /api/v1/admin/merchant
    // Create Merchant using admin previleges
    merchant: (req, res) => {
        // Collect the post parameters
        let name = req.body.name;
        let address = req.body.address;
        let email = req.body.email;

        // Dont proceed if merchant name or address is empty
        if(!name || !address){
            return res.failed("Name or Address can not be empty");
        }

        // Dont proceed if merchant name or address is empty
        if(!email){
            return res.failed("Email address can not be empty");
        }

        // Convert all emails to lowercase
        email = email.toLowerCase();

        let secret_key = "secret_" + auth_function.generate_token(30);
        let public_key = "public_" + auth_function.generate_token(30);

        // Create the check in location
        merchant_db.create({
            company_name: name,
            company_address: address,
            email: email,
            secret_key: secret_key,
            public_key: public_key,
        }, (err, update) => {
            // Return the token for the check in location
            res.success(undefined, "Merchant successfully created");
        });

    },

    // GET /api/v1/admin/merchant
    // Get all merchant
    get_merchants: (req, res) => {
        merchant_db.find({}, (err, merchants) => {
            res.success(merchants);
        });
    },

    // DELETE /api/v1/admin/merchant/:merchant_Id
    // Delete a specific merchant 
    delete_merchant: (req, res) => {
        let id = req.params.merchant_Id;

        merchant_db.remove({ _id: id }, (err, status) => {
            res.success(undefined, "Successfully Deleted");
        });
    },


}
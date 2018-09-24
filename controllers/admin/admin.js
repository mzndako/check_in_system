const admin_db = require("./../../database/models/admin");
const user_db = require("./../../database/models/user");
const account_db = require("./../../database/models/account");
const check_in_location_db = require("./../../database/models/check_in_location");
const merchant_db = require("./../../database/models/merchant");
const auth_function = require("./../../functions/auth");
const location_function = require("./../../functions/location");
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
                var token = jwt.sign(payload, config.jwt_secret_key_admin, {
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
            return res.status(403).send({status: false, message: "Please provide a valid longitude and latitute"});
        }

        if(!name || !address){
            return res.status(403).send({status: false, message: "Name or Address can not be empty"});
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
            res.send({status: true, data: { name: name, token: token }});
        });

    },

    // GET /api/v1/admin/check_in_location
    // Get all check in location
    get_locations: (req, res) => {
        check_in_location_db.find({}, (err, locations) => {
            res.send({status: true, data: locations});
        });
    },

    // DELETE /api/v1/admin/check_in_location/:location_Id
    // Delete a specific check in location
    delete_location: (req, res) => {
        let id = req.params.location_Id;

        check_in_location_db.remove({ _id: id }, (err, status) => {
            res.send({status: true, message: "Successfully Deleted"});
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
            return res.status(403).send({status: false, message: "Name or Address can not be empty"});
        }

        // Dont proceed if merchant name or address is empty
        if(!email){
            return res.status(403).send({status: false, message: "Email address can not be empty"});
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
            res.send({status: true, message: "Merchant successfully created", data: {secret_key, public_key}});
        });

    },

    // GET /api/v1/admin/merchant
    // Get all merchant
    get_merchants: (req, res) => {
        merchant_db.find({}, (err, merchants) => {
            res.send({status: true, data: merchants});
        });
    },

    // DELETE /api/v1/admin/merchant/:merchant_Id
    // Delete a specific merchant 
    delete_merchant: (req, res) => {
        let id = req.params.merchant_Id;

        merchant_db.remove({ _id: id }, (err, status) => {
            res.send({status: true, message: "Successfully Deleted"});
        });
    },

    /**
     * POST /api/v1/admin/user
     * Create a user
     */
    create_user: (req, res)=>{
        // Collect the user information
        let email           = req.body.email;
        let first_name      = req.body.first_name;
        let last_name       = req.body.last_name;
        let home_address    = req.body.home_address;
        let office_address  = req.body.office_address;
        let card_number     = req.body.card_number;
        let pin             = req.body.default_pin;

        // Most provide at least a first name or last name
        if(!first_name && !last_name){
            return res.status(403).send({status: false, message: "First Name and Last Name can not both be empty"});
        }

        // Make sure card number and/or pin is not empty.
        // The PIN can be change later by the user
        if(!card_number || !pin){
            return res.status(403).send({status: false, message: "Please provide user card number and pin"});
        }

        // Make sure valid email is submitted
        if(!email){
            return res.status(403).send({status: false, message: "Email address can not be empty"});
        }

        email = email.toLowerCase(); // Convert to lowercase for future ease of search
        
        // Make sure the user email doesn't already exist
        user_db.findOne({email: email}, (err, user)=>{
            if(user){
                return res.status(403).send({status: false, message: "Email address already exist"});
            }

            // Make sure the card number is not being used by another user
            account_db.findOne({card_number: card_number}, (err, account)=>{
                if(account){
                    return res.status(403).send({status: false, message: "Card Number already exist"});
                }

                let payload = {
                    email, first_name, last_name, home_address, office_address
                }

                // Create the user
                user_db.create(payload, (err, status)=>{
                    if(err) throw err;

                    // Create the card details
                    account_db.create({
                        email: email,
                        card_number: card_number,
                        pin: auth_function.encrypt_password(pin)
                    }, ()=>{
                        // SEND EMAIL TO THE USER EMAIL ADDRESS

                        // Return success message to the admin
                        res.status(200).send({status: true, message: "Account Created Successfully"});
                    });

    
                })
            });
        });

    },

    /**
     * GET /api/v1/admin/user/
     * Get all users in the platform
     */
    get_users: (req, res)=>{
        user_db.find({}, (err, users)=>{
            account_db.find({}, (err, accounts)=>{
                // Remarp the accounts 
                let remapped_accounts = {};
                accounts.forEach((account)=>{
                    remapped_accounts[account.email] = account.toJSON();
                    // Remove the pin
                    delete remapped_accounts[account.email].pin; 
                });

                let data = [];

                // Loop through the users record and merge its respective card number to it
                users.forEach((user)=>{
                    let payload = user.toJSON();
                    payload.account = remapped_accounts[payload.email];
                    payload.account.amount = location_function.format_amount(location_function.dollars(payload.account.points));
                    data.push(payload);
                });

                res.send({status: true, data});
            })
        })
    },

    delete_user: (req, res)=>{
        let user_Id = req.params.user_Id;
        // Let find if the user exist first
        user_db.findOne({_id: user_Id}, (err, user)=>{
            if(!user){
                return res.status(403).send({status: false, message: "User does not exist"});
            }
            // Remove the user
            user_db.remove({_id: user_Id}, (err, status)=>{
                if(err) throw err;
                // Remove the user card details
                account_db.remove({email: user.email}, (err, status)=>{
                    if(err) throw err;
                    res.send({status: true, message: "User deleted successfully"});
                })
            })
        });
    }


}
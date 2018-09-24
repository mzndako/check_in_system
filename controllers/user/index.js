const location_function = require("./../../functions/location");
const account_db = require("./../../database/models/account");
const user_db = require("./../../database/models/user");
const logs_db = require("./../../database/models/logs");
const auth_function = require("./../../functions/auth");
const config = require("./../../config/config");
const jwt = require('jsonwebtoken');

module.exports = {
    /**
     * POST /api/v1/user/login
     * User login using their card_number and pin
     */
    login: (req, res) => {
        // Collect the submitted username and password
        let card_number = req.body.card_number;
        let pin = req.body.pin;

        if (!card_number || !pin) {
            return res.status(401).send({ status: false, message: "Please provide a valid card number and pin" });
        }

        // Search for the card number in the account collection
        account_db.findOne({ card_number: card_number }, (err, account) => {
            if (!account) {
                return res.status(401).send({ status: false, message: "Invalid card Number" });
            }

            auth_function.verify_password(pin, account.pin, (status) => {
                if (!status) {
                    return res.status(401).send({ status: false, message: "Invalid PIN" });
                }
                let payload = {
                    email: account.email,
                };
                var token = jwt.sign(payload, config.jwt_secret_key_user, {
                    expiresIn: 10 * 60 // Expires in 5 mins
                });
                res.send({ status: true, token: token });
            });


        })

    },

    /**
     * GET /api/v1/user/account
     * Get the login user account details 
     */
    get_account: (req, res) => {

        // Create the check in location
        account_db.findOne({email: req.user.email}, {pin: 0}, (err, account)=>{
            // Get the login user details gotten when the user login
            let data = req.user.toJSON();
            data.account = account.toJSON();
            // Convert the points to amount and format the amount (currency)
            let amount = location_function.dollars(data.account.points);
            data.account.amount = location_function.format_amount(amount);

            res.send({status: true, data});
        });

    },

    /**
     * PUT /api/v1/user/account
     * Update user name
     */
    update_account: (req, res) => {
        let first_name = req.body.first_name;
        let last_name  = req.body.last_name;

        // Create the check in location
        user_db.update({email: req.user.email}, {$set: {first_name: first_name, last_name: last_name}}, (err, update)=>{
            if(err) throw err;

            res.send({status: true, message: "User Account updated successfully"});
        });
    },

    /**
     * PUT /api/v1/user/account/change_pin
     * Change User PIN
     */
    change_pin: (req, res) => {
        let old_pin = req.body.old_pin;
        let new_pin = req.body.new_pin;
        
        // Check for new pin and old pin sent to the server
        if(!new_pin || !old_pin){
            return res.status(403).send({status: false, message: "New PIN or Old PIN can not be empty"})
        }

        // Search for the user account in the account collection
        account_db.findOne({ email: req.user.email }, (err, account) => {
            if (err) {
                throw err;
            }

            auth_function.verify_password(old_pin, account.pin, (status) => {
                if (!status) {
                    return res.status(401).send({ status: false, message: "Invalid PIN" });
                }
                // Encrypt and Set the new PIN
                account.pin = auth_function.encrypt_password(new_pin);
                account.save(); // Save
                res.send({ status: true, message: "Pin change successfully" });
            });


        })
    },

    /**
     * GET /api/v1/user/logs
     * Fetch the user travell logs
     */
    logs: (req, res)=>{
        logs_db.find({email: req.user.email}, {_id: 0}, {sort: "date"}, (err, logs)=>{
            if(err) throw err;
            let data = [];
            logs.forEach((row)=>{
                let log = row.toJSON();
                // Convert points to amount
                let amount = location_function.dollars(log.points);
                // Format amount
                log.amount = location_function.format_amount(amount);
                data.push(log);
            })
            res.send({status: true, data});
        });
    }

}
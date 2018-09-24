const location_function = require("./../../functions/location");
const account_db = require("./../../database/models/account");
const user_db = require("./../../database/models/user");
const merchant_db = require("./../../database/models/merchant");
const auth_function = require("./../../functions/auth");
const config = require("./../../config/config");
const jwt = require('jsonwebtoken');

module.exports = {
    /**
     * POST /api/v1/merchant/fetch_user
     * Fetch the user account details using the user card number and the merchant public key
     */
    fetch_user: (req, res) => {
        // Collect the submitted card number and public key
        let card_number = req.body.card_number;
        let merchant_public_key = req.body.public_key;

        if (!card_number || !merchant_public_key) {
            return res.status(401).send({ status: false, message: "Please provide a valid card number and public key" });
        }

        // Search for the card number in the account collection
        merchant_db.findOne({ public_key: merchant_public_key }, (err, merchant) => {
            if (!merchant) {
                return res.status(401).send({ status: false, message: "Invalid Merchant Public Key" });
            }

            // Find the user account
            account_db.findOne({ card_number: card_number }, (err, account) => {
                if (!account) {
                    return res.status(401).send({ status: false, message: "Invalid Card Number" });
                }
                // Get the user details
                user_db.findOne({ email: account.email }, { first_name: 1, last_name: 1 }, (err, user) => {
                    if (err) throw err;
                    // Return the user found
                    let data = user.toJSON();
                    data.card_number = card_number;
                    data.email = account.email;
                    data.account_balance = location_function.format_amount(location_function.dollars(account.points));

                    res.send({ status: true, data: data }); // Send to merchant
                });
            })

        })

    },
    /**
     * POST /api/v1/merchant/charge_user
     * Charge the user account
     */
    charge_user: (req, res) => {
        // Collect the submitted card number, pin and client secret key
        let card_number = req.body.card_number;
        let pin = req.body.pin;
        let merchant_secret_key = req.body.secret_key;
        let charge_amount = parseFloat(req.body.amount);

        if (!card_number || !merchant_secret_key || !pin || !charge_amount) {
            return res.status(401).send({ status: false, message: "Please provide a valid card number, secret key, pin and amount" });
        }

        // Search for the card number in the account collection
        merchant_db.findOne({ secret_key: merchant_secret_key }, (err, merchant) => {
            if (!merchant) {
                return res.status(401).send({ status: false, message: "Invalid Merchant Secret key" });
            }

            account_db.findOne({ card_number: card_number }, (err, account) => {
                // Check card number
                if (!account) {
                    return res.status(401).send({ status: false, message: "Invalid Card Number" });
                }

                // Verify the user pin submitted
                auth_function.verify_password(pin, account.pin, (status) => {
                    if (!status) {
                        return res.status(401).send({ status: false, message: "Invalid PIN" });
                    }
                    // Check user balance is enough
                    let deduct_point = location_function.convert_amount_to_points(charge_amount);

                    if(deduct_point > account.points){
                        return res.status(403).send({ status: false, message: "Insufficent Balance" });
                    }

                    // Deduct the point from the user balance
                    account.points -= deduct_point;
                    account.save(); // Save
                    
                    res.send({ status: true, message: "User charged successfully" });
                });
            });

        })

    }
}
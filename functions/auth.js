const adminDB = require("./../database/models/admin");
const config = require("./../config/config");
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const rand_token = require('rand-token').suid;

module.exports = {
    // Check whether the user is an admin
    admin_login: (req, res, next) => {
        var token = req.headers['x-access-token'];

        // Setup the success function 
        res.success = (data, message) => {
            return res.send({ status: true, data: data, message: message })
        };

        // Setup the failed function
        res.failed = (message) => {
            res.status(404);
            return res.send({ status: false, message: message });
        };

        // Check if token is set
        if (token) {
            jwt.verify(token, config.jwt_secret_key, (err, decoded) => {
                if (err) {
                    res.status(401).send({ success: false, message: 'Failed to authenticate token.' });
                } else {
                    // check if account is Blocked
                    adminDB.findOne({ username: decoded.username }, (err, admin) => {
                        if (!admin) {
                            res.failed("Invalid Token");
                            return;
                        }
                        req.admin = admin;
                        next();
                    });
                }
            });
        } else {
            res.status(401).send({ success: false, message: 'No Token Provided' });
        }
    },

    encrypt_password: (password) => {
        return bcrypt.hashSync(password);
    },

    verify_password: (raw_password, hashed_password, callback) => {
        bcrypt.compare(raw_password, hashed_password, (err, crypt) => {
            callback(crypt);
        })
    },

    generate_token: (length = 50) => {
        // Generate a 16 character token:
        let token = rand_token(length);
        return token;
    }
}
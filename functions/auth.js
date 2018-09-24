const admin_db      = require("./../database/models/admin");
const user_db       = require("./../database/models/user");
const config        = require("./../config/config");
const bcrypt        = require('bcrypt-nodejs');
const jwt           = require('jsonwebtoken');
const rand_token    = require('rand-token').suid;

module.exports = {
    // Validate token and make sure it belongs to admin
    admin_login: (req, res, next) => {
        var token = req.headers['x-access-token'];

        // Check if token is set
        if (token) {
            jwt.verify(token, config.jwt_secret_key_admin, (err, decoded) => {
                if (err) {
                    res.status(401).send({ success: false, message: 'Failed to authenticate token.' });
                } else {
                    // Search for the decoded user from the admin collection
                    admin_db.findOne({ username: decoded.username }, (err, admin) => {
                        if (!admin) {
                            return res.status(401).send({status: false, message: "Invalid Token"});
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

    // Validate token and make sure it belongs to user
    user_login: (req, res, next) => {
        var token = req.headers['x-access-token'];

        // Check if token is set
        if (token) {
            jwt.verify(token, config.jwt_secret_key_user, (err, decoded) => {
                if (err) {
                    res.status(401).send({ success: false, message: 'Failed to authenticate token.' });
                } else {
                    // Search for the decoded user from the user collection
                    user_db.findOne({ email: decoded.email }, (err, user) => {
                        if (!user) {
                            return res.status(401).send({status: false, message: "Invalid Token"});
                        }
                        req.user = user;
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
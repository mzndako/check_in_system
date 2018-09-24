//During the test the env variable is set to test
process.env.DATABASE = 'CHECK_IN_TEST';

let mongoose = require("mongoose");
let admin_db = require('./../database/models/admin');
let user_db = require('./../database/models/user');
let account_db = require('./../database/models/account');
let check_in_db = require('./../database/models/check_in_location');
let auth_function = require('./../functions/auth');
let location_function = require('./../functions/location');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../app');
let should = chai.should();


chai.use(chaiHttp);
let token = "";

let user = {
    "email": "test@gmail.com",
    "first_name": "Test",
    "last_name": "test",
    "home_address": {
        "address": "Room 131, Sabo, Yaba, Lagos",
        "longitude": 7,
        "latitude": 7
    }
}
let card = {
    email: user.email,
    "card_number": "45555-2837-3622",
    "pin": auth_function.encrypt_password("4321")
}
let check_in_location = {
    "name": "Izone",
    "address": "Yaba Lagos",
    longitude: 7.1221,
    latitude: 6.2344,
    authorization_token: auth_function.generate_token(30)
}

//Our User parent block
describe('Check In API Test', () => {
    beforeEach((done) => { //Before each test we empty the user, account and check in collection
        user_db.remove({}, (err) => {
            account_db.remove({}, (err) => {
                check_in_db.remove({}, (err) => {
                    done();
                });
            });
        });
    });
    /*
      * Test the /POST route
      */
    describe('POST /api/v1/location/check_in', () => {
        it("it SHOULD check in the user to the location", (done) => {

            let user_obj = new user_db(user);
            user_obj.save((err, user_update) => {
                // Add new account
                let account_obj = new account_db(card);
                account_obj.save((err, act_update) => {
                    // Create a new check in location
                    new check_in_db(check_in_location).save((err, check_update) => {
                        chai.request(server)
                            .post("/api/v1/location/check_in")
                            .send({
                                token: check_in_location.authorization_token,
                                card_number: card.card_number,
                                pin: "4321"
                            })
                            .end((err, res) => {
                                res.should.have.status(200);
                                done();
                            })
                    })
                })
            })
        });

        it("it SHOULD return user has already been checked in", (done) => {
            // setup user last location
            user.last_location = {};
            user.last_location.longitude = check_in_location.longitude;
            user.last_location.latitude = check_in_location.latitude;

            let user_obj = new user_db(user);
            user_obj.save((err, user_update) => {
                // Add new account
                let account_obj = new account_db(card);
                account_obj.save((err, act_update) => {
                    // Create a new check in location
                    new check_in_db(check_in_location).save((err, check_update) => {
                        chai.request(server)
                            .post("/api/v1/location/check_in")
                            .send({
                                token: check_in_location.authorization_token,
                                card_number: card.card_number,
                                pin: "4321"
                            })
                            .end((err, res) => {
                                res.should.have.status(403);
                                res.body.message.should.eql("User has already been Checked In");
                                done();
                            })
                    })
                })
            })
        });

        /**
         * Check Incorrect PIN
         */
        it("it SHOULD return INCORRECT PIN", (done) => {
            // setup user last location
            user.last_location = {};

            let user_obj = new user_db(user);
            user_obj.save((err, user_update) => {
                // Add new account
                let account_obj = new account_db(card);
                account_obj.save((err, act_update) => {
                    // Create a new check in location
                    new check_in_db(check_in_location).save((err, check_update) => {
                        chai.request(server)
                            .post("/api/v1/location/check_in")
                            .send({
                                token: check_in_location.authorization_token,
                                card_number: card.card_number,
                                pin: "1234"
                            })
                            .end((err, res) => {
                                res.should.have.status(401);
                                res.body.message.should.eql("Incorrect PIN");
                                done();
                            })
                    })
                })
            })
        });


        /**
         * Check incorrect token
         */
        it("it SHOULD return incorrect check in location token", (done) => {
            // setup user last location
            user.last_location = {};

            let user_obj = new user_db(user);
            user_obj.save((err, user_update) => {
                // Add new account
                let account_obj = new account_db(card);
                account_obj.save((err, act_update) => {
                    // Create a new check in location
                    new check_in_db(check_in_location).save((err, check_update) => {
                        chai.request(server)
                            .post("/api/v1/location/check_in")
                            .send({
                                token: auth_function.generate_token(30),
                                card_number: card.card_number,
                                pin: "4321"
                            })
                            .end((err, res) => {
                                res.should.have.status(401);
                                res.body.message.should.eql("Invalid Check In Location Token");
                                done();
                            })
                    })
                })
            })
        });
    });
});


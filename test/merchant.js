//During the test the env variable is set to test
process.env.DATABASE = 'CHECK_IN_TEST';

let mongoose = require("mongoose");
let admin_db = require('./../database/models/admin');
let user_db = require('./../database/models/user');
let account_db = require('./../database/models/account');
let merchant_db = require('./../database/models/merchant');
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

let user = {};
let card = {};
let check_in_location = {};
let merchant = {};

//Our User parent block
describe('Merchant Fetch and Charge User API Test', () => {
    before((done) => {
        let login = {
            username: "admin",
            password: "admin"
        }
        chai.request(server)
            .post('/api/v1/admin/login')
            .send(login)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property("token");
                token = res.body.token;
                done();
            });
    }),
        beforeEach((done) => { //Before each test we empty the user, account and check in collection
            user = {
                "email": "test@gmail.com", "first_name": "Test", "last_name": "test", "home_address": {
                    "address": "Room 131, Sabo, Yaba, Lagos", "longitude": 7,
                    "latitude": 7
                }
            };
            card = {
                email: user.email,
                "card_number": "45555-2837-3622",
                "pin": "4321"
            };
            check_in_location = {
                "name": "Izone",
                "address": "Yaba Lagos",
                longitude: 7.1221,
                latitude: 6.2344
            };
            user.card_number = card.card_number;
            user.default_pin = card.pin;

            user_db.remove({}, (err) => {
                account_db.remove({}, (err) => {
                    check_in_db.remove({}, (err) => {
                        merchant_db.remove({}, (err) => {
                            // Create the new user
                            chai.request(server)
                                .post("/api/v1/admin/user")
                                .send(user)
                                .set("x-access-token", token)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                })

                            // Create the new merchant    
                            chai.request(server)
                                .post("/api/v1/admin/merchant")
                                .send({
                                    name: "Quicktel Solution",
                                    email: "merchant@email.com",
                                    address: "Lagos"
                                })
                                .set("x-access-token", token)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    merchant = res.body.data;
                                })

                            chai.request(server)
                                .post("/api/v1/admin/check_in_location")
                                .send(check_in_location)
                                .set("x-access-token", token)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    check_in_location.token = res.body.data.token;
                                    done();
                                })
                        });
                    });
                });
            });
        });
    /*
      * Test the fetch user detail route
      */
    describe('POST /api/v1/merchant/fetch_user', () => {
        it("it should fetch user using valid public key and card number", (done) => {
            chai.request(server)
                .post("/api/v1/merchant/fetch_user")
                .send({
                    public_key: merchant.public_key,
                    card_number: card.card_number,
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.account_balance.should.eql("$ 0.00");
                    done();
                })
        })

        it("it should return Invalid Merchant Public Key using incorrect key", (done) => {
            chai.request(server)
                .post("/api/v1/merchant/fetch_user")
                .send({
                    public_key: "kljsafojosidfjosjflsjdlafjoodjsfao",
                    card_number: card.card_number,
                })
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.message.should.eql("Invalid Merchant Public Key");
                    done();
                })
        })

        it("it should return Invalid card number using incorrect card number", (done) => {
            chai.request(server)
                .post("/api/v1/merchant/fetch_user")
                .send({
                    public_key: merchant.public_key,
                    card_number: "84894-23-2333",
                })
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.message.should.eql("Invalid Card Number");
                    done();
                })
        })
    });
    /*
      * Test the charge user route
      */
    describe('POST /api/v1/merchant/charge_user', () => {
        it("it should return insufficent funds", (done) => {
            chai.request(server)
                .post("/api/v1/merchant/charge_user")
                .send({
                    secret_key: merchant.secret_key,
                    card_number: card.card_number,
                    pin: card.pin,
                    amount: 50
                })
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.message.should.eql("Insufficent Balance");
                    done();
                })
        })

      
    });
});


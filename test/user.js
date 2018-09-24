//During the test the env variable is set to test
process.env.DATABASE = 'CHECK_IN_TEST';

let mongoose = require("mongoose");
let admin_db = require('./../database/models/admin');
let user_db = require('./../database/models/user');
let logs_db = require('./../database/models/logs');
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
let user_token = "";

let user = {};
let card = {};

//Our User parent block
describe('User Login, Retrieve and Update User Account Details API Test', () => {
    before((done) => {
        let login = {
            username: "admin",
            password: "admin"
        }
        logs_db.remove({}, ()=>{ // Clear logs db
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

        })
        
    })

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
                // Create the new user
                chai.request(server)
                    .post("/api/v1/admin/user")
                    .send(user)
                    .set("x-access-token", token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        done();
                    })
            });
        });
    });

    /**
     * TEST: Perform user login
     */
    describe("/POST /api/v1/user/login", ()=>{
        it("It should login successfully", (done)=>{
            chai.request(server)
            .post("/api/v1/user/login")
            .send({
                card_number: card.card_number,
                pin: card.pin
            })
            .end((err, res)=>{
                res.should.have.status(200);
                user_token = res.body.token;
                done()
            })
        });
    });

    /*
      * Test the fetch user detail route
      */
    describe('GET /api/v1/user/account', () => {
        it("it should fetch user account details", (done) => {
            chai.request(server)
                .get("/api/v1/user/account")
                .set("x-access-token", user_token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.account.amount.should.eql("$ 0.00");
                    done();
                })
        })

        it("Using admin token should return invalid token", (done) => {
            chai.request(server)
                .get("/api/v1/user/account")
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                })
        })
    });
    /*
      * Test: change the user first name and last name
      */
    describe('PUT /api/v1/user/account', () => {
        it("this should change the user first name and last name", (done) => {
            chai.request(server)
                .put("/api/v1/user/account")
                .send({
                    first_name: "Muhammad",
                    last_name: "Last Name"
                })
                .set("x-access-token", user_token)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                })
        })
    });
    /*
      * Test: Change user pin
      */
    describe('PUT /api/v1/user/account/change_pin', () => {
        it("This should return success for pin change", (done) => {
            chai.request(server)
                .put("/api/v1/user/account/change_pin")
                .send({
                    old_pin: card.pin,
                    new_pin: "1222"
                })
                .set("x-access-token", user_token)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                })
        })

        it("This should return 401 for invalid pin", (done) => {
            chai.request(server)
                .put("/api/v1/user/account/change_pin")
                .send({
                    old_pin: "5855",
                    new_pin: "1222"
                })
                .set("x-access-token", user_token)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                })
        })


    });
    /*
      * Test: Fetch logs
      */
    describe('GET /api/v1/user/logs', () => {
        it("This should return zero length for empty log", (done) => {
            chai.request(server)
                .get("/api/v1/user/logs")
                .set("x-access-token", user_token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.length.should.be.eql(0)
                    done();
                })
        })
    });
});


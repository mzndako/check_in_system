//During the test the env variable is set to test
process.env.DATABASE = 'CHECK_IN_TEST';

let mongoose = require("mongoose");
let admin_db = require('./../../database/models/admin');
let user_db = require('./../../database/models/user');
let account_db = require('./../../database/models/account');
let auth_function = require('./../../functions/auth');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../../app');
let should = chai.should();


chai.use(chaiHttp);
let token = "";

//Our User parent block
describe('Perform Admin User function using token API Test', () => {
    beforeEach((done) => { //Before each test we empty the user and account collection
        user_db.remove({}, (err) => {
            account_db.remove({}, (err) => {
                done();
            })
        })
    });
    /*
      * Test the /POST route
      */
    describe('/LOGIN ADMIN', () => {
        it('it should login successfully and return admin login token', (done) => {
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
        });
    });

    /**
     * Test Create User
     */
    describe('/POST /api/v1/admin/user', () => {
        it('it should create a new user', (done) => {
            let user = {
                "email": "test@gmail.com",
                "first_name": "Test",
                "last_name": "test",
                "home_address": {
                    "address": "Room 131, Sabo, Yaba, Lagos",
                    "longitude": 7,
                    "latitude": 7
                },
                "card_number": "45555-2837-3621",
                "default_pin": "4321"
            };
            chai.request(server)
                .post('/api/v1/admin/user')
                .set("x-access-token", token)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property("status").eql(true);
                    done();
                });
        });
    });

    describe("GET /api/v1/admin/users", () => {
        it("it should return all users", (done) => {
            let params = {
                "email": "test@gmail.com",
                "first_name": "Test",
                "last_name": "test",
                "home_address": {
                    "address": "Room 131, Sabo, Yaba, Lagos",
                    "longitude": 7,
                    "latitude": 7
                },
                "card_number": "45555-2837-3622",
                "default_pin": "4321"
            };
            let user = new user_db(params);
            user.save((err, usr)=>{
                let account = new account_db({
                    email: params.email,
                    card_number: params.card_number,
                    pin: auth_function.encrypt_password(params.default_pin)
                });
                account.save((err, act)=>{
                    chai.request(server)
                    .get("/api/v1/admin/user")
                    .set("x-access-token", token)
                    .end((err, res)=>{
                        // console.log(res.body);
                        res.should.have.status(200);
                        // res.body.data.should.have.length(1);
                        done();
                    })
                })
                
            })
        });
    });
    /**
     * Delete user test
     */
    describe("DELETE /api/v1/admin/user/:user_Id", ()=>{
        it("It should Delete a user", (done)=>{
            let params = {
                "email": "test@gmail.com",
                "first_name": "Test",
                "last_name": "test",
                "home_address": {
                    "address": "Room 131, Sabo, Yaba, Lagos",
                    "longitude": 7,
                    "latitude": 7
                },
                "card_number": "45555-2837-3622",
                "default_pin": "4321"
            };
            let user = new user_db(params);
            user.save((err, usr)=>{
                let account = new account_db({
                    email: params.email,
                    card_number: params.card_number,
                    pin: auth_function.encrypt_password(user.default_pin)
                })
                account.save((err, act)=>{
                    chai.request(server)
                    .delete("/api/v1/admin/user/"+usr.id)
                    .set("x-access-token", token)
                    .end((err, res)=>{
                        res.should.have.status(200);
                        done();
                    })
                })
            })
        })
    })


});
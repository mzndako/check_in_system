//During the test the env variable is set to test
process.env.DATABASE = 'CHECK_IN_TEST';

let mongoose = require("mongoose");
let admin_db = require('./../../database/models/admin');
let user_db = require('./../../database/models/user');
let account_db = require('./../../database/models/account');
let merchant_db = require('./../../database/models/merchant');
let check_in_db = require('./../../database/models/check_in_location');
let auth_function = require('./../../functions/auth');
let location_function = require('./../../functions/location');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../../app');
let should = chai.should();


chai.use(chaiHttp);
let token = "";

let merchant = {};

//Our User parent block
describe('Admin Create, Get and Delete Merchant API Test', () => {
    before((done) => {
        // Perform Admin Login
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

        beforeEach((done) => { //Before each test we empty the merchant collection collection
            merchant = {
                name: "Quicktel SOlution",
                address: "Yaba, Lagos",
                email: "test@gmail.com"
            };
            // Remove all merchant
            merchant_db.remove({}, (err) => {
                done();
            });
        });

    /*
      * Add merchant detail route
      */
    describe('POST /api/v1/admin/merchant', () => {
        it("it should be able to create merchant", (done) => {
            chai.request(server)
                .post("/api/v1/admin/merchant")
                .send(merchant)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.status.should.eql(true);
                    done();
                })
        })

        it("it should not create a merchant if email is not provided", (done) => {
            delete merchant.email;
            chai.request(server)
                .post("/api/v1/admin/merchant")
                .send(merchant)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.message.should.eql("Email address can not be empty");
                    done();
                })
        })
    });
    /*
      * Test fetch all merchants
      */
    describe('GET /api/v1/admin/merchant', () => {
        it("it should return one merchant", (done) => {
            let merchant_obj = new merchant_db(merchant);
            merchant_obj.save((err, update)=>{
                chai.request(server)
                .get("/api/v1/admin/merchant")
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.length.should.be.eql(1);
                    done();
                })
            })
            
        })
    });
    /*
      * Test detele merchants
      */
    describe('DELETE /api/v1/admin/merchant/:merchant_Id', () => {
        it("it should return status true", (done) => {
            let merchant_obj = new merchant_db(merchant);
            merchant_obj.save((err, update)=>{
                chai.request(server)
                .delete("/api/v1/admin/merchant/"+update.id)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.status.should.eql(true);
                    done();
                })
            })
            
        })
    });

});


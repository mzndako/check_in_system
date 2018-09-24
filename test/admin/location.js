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

let location = {};

//Our User parent block
describe('Admin Create, Get and Delete Location API Test', () => {
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

        beforeEach((done) => { //Before each test we empty the location collection collection
            location = {
                "name": "Izone",
                "address": "Yaba Lagos",
                longitude: 7.1221,
                latitude: 6.2344
            };
            // Remove all location
            check_in_db.remove({}, (err) => {
                done();
            });
        });

    /*
      * Add location detail route
      */
    describe('POST /api/v1/admin/location', () => {
        it("it should be able to create location", (done) => {
            chai.request(server)
                .post("/api/v1/admin/check_in_location")
                .send(location)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.status.should.eql(true);
                    done();
                })
        })

        it("it should not create a location longitude and latitude", (done) => {
            delete location.longitude;
            chai.request(server)
                .post("/api/v1/admin/check_in_location")
                .send(location)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.message.should.eql("Please provide a valid longitude and latitute");
                    done();
                })
        })
    });
    /*
      * Test fetch all locations
      */
    describe('GET /api/v1/admin/check_in_location', () => {
        it("it should return one location", (done) => {
            let location_obj = new check_in_db(location);
            location_obj.save((err, update)=>{
                chai.request(server)
                .get("/api/v1/admin/check_in_location")
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
      * Test delete location
      */
    describe('DELETE /api/v1/admin/check_in_location/:location_Id', () => {
        it("it should return status true", (done) => {
            let location_obj = new check_in_db(location);
            location_obj.save((err, update)=>{
                chai.request(server)
                .delete("/api/v1/admin/check_in_location/"+update.id)
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


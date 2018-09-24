//During the test the env variable is set to test
process.env.DATABASE = 'CHECK_IN_TEST';

let mongoose = require("mongoose");
let admin_db = require('./../database/models/admin');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();


chai.use(chaiHttp);
//Our parent block
describe('Admin', () => {
    beforeEach((done) => { //Before each test we empty the database
        // admin_db.remove({}, (err) => { 
        //    done();           
        // });   
        done();     
    });
/*
  * Test the /POST route
  */
  describe('/LOGIN book', () => {
      it('it should POST to login', (done) => {
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
              done();
            });
      });
  });

});
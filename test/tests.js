var should = require('chai').should();
var expect = require('chai').expect;
var request = require('supertest');
var api = request('http://localhost:3001');

describe('URL tests', function() {
  it('should return registration page', function(done) {
  	api.get('/')
      .end(function(err, res) {
        expect(res.statusCode).to.equal(200);
        done();
      });
  });
});
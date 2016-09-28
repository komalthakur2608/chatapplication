var passport = require("passport");
var passportJWT = require("passport-jwt");
var cfg = require("./config.js");
var ExtractJwt = passportJWT.ExtractJwt;
var Strategy = passportJWT.Strategy;
var mongoose = require('mongoose');
var userRegister = require('../models/RegisterModel')
var params = {
secretOrKey: cfg.jwtSecret,
jwtFromRequest: ExtractJwt.fromAuthHeader()
};

module.exports = function() {
var strategy = new Strategy(params, function(payload, done) {

	userRegister.findOne({'name' : payload.username, 'password' : payload.password}, function(err, doc){
      if(doc != null) {
        return done(null, {'name': username, 'password' : password});
      }
      else {
        return done(new Error("User not found"), null);
      }
    })
});
passport.use(strategy);
return {
initialize: function() {
return passport.initialize();
},
authenticate: function() {
return passport.authenticate("jwt", cfg.jwtSession);
}
};
};
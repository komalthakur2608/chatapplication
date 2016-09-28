var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var passport = require('passport');

var userRegister = require('../models/RegisterModel')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('MultiChatView', { title: 'Express' });
});

router.get('/login', passport.authenticate('jwt', { session: false}),
    function(req, res) {
       res.send("bsjjnsdkabjabskbkbdsjb jds");
    }
);

router.post('/register', function(req, res, next) {

	userRegister.findOne({'name' : req.body.username, 'password' : req.body.password}, function(err, doc){
      if(doc != null) {
       	var token = jwt.sign({ name: req.body.username }, 'komal');
       	token = 'JWT '+ token;
       	res.send(token);
       }
      else {
      	console.log('user does not exists');
      	res.send('fail');
      }
    })
});

module.exports = router;

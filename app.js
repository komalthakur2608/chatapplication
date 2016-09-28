var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var io = require('socket.io');
var mongoose = require('mongoose');
var ss = require('socket.io-stream');
var fs = require('fs');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var passport = require('passport');

var PersonChat = require('./models/PersonChatModel')
var userRegister = require('./models/RegisterModel')

var routes = require('./routes/index');
var users = require('./routes/users');
var app = express();
var people = {}; 
var socketsArr = {}; 
var people_in_chat = [];

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use("/uploads", express.static(__dirname + "/uploads"));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//mongoose connect
mongoose.connect('mongodb://localhost/mychatapp');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("holla we are connected!!!!!")
});

//setting opts and strategy for passport-jwt
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
opts.secretOrKey = 'komal';

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    userRegister.findOne({name: jwt_payload.name}, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
}));

var socket = io.listen(app.listen(3001));

socket.on('connection', function(client) {

  client.on('join', function(username, password) {

    userRegister.findOne({'name' : username, 'password' : password}, function(err, doc){
      if(doc != null) {
        people[client.id] = username;
        socketsArr[client.id] = client;
        console.log("join event");
        client.emit("welcome", "Welcome to My chat " + username);
        socket.emit("available_people", people);
      }
      else {
        client.emit('invalidlogin');
      }
    })
  }) 

  client.on('signup', function(username, password){

    userRegister.findOne({'name' : username}, function(err, doc){
      if(doc != null) {
        client.emit('signupFail');
       
      }
      else {
        var temp = new userRegister({'name' : username, 'password' : password});
        temp.save(function(err, temp){
            if (err) return console.error(err);
        })

        client.emit('signupSuccess');
      }
    })
  })

  client.on('send' , function(ids,msg) {
    var clients = ids.split('-');
    clients.sort(function(a, b) {
      return a > b;
    });

    if(PersonChat.findOne({ 'uniqueid' : clients[0]+clients[1]}, function(err, doc){
      if(doc != null) {
        doc.chat.push({'sender' : people[client.id], 'message' : msg});
        doc.save(function(){
          console.log("message saved")
        })
      }
      
      else {

        var temp = new PersonChat({'user1' : clients[0] , 
          'user2' : clients[1], 
          'uniqueid' : clients[0]+clients[1],
          'chat' : [{'sender' : people[client.id], 'message' : msg}]
        });

        temp.save(function(err, temp){
          if (err) return console.error(err);
        })
      }

    }))

    console.log("clients"+ clients);
    var keys = Object.keys(people);
    for(var i =0 ; i<keys.length; i++){
      for(var j = 0; j<clients.length; j++){
        if(clients[j] == people[keys[i]]){
          console.log(clients[j]);
          socketsArr[keys[i]].emit('chat', msg, ids, people[client.id]);
        }
      }

    }
  })

  ss(client).on('uploadFile', function(stream, data, ids){
    var splitArr = ids.split('-');
    var id = splitArr[1].replace('file', '');
    var reciever;
    var filename = 'uploads/'+data.name;
    stream.pipe(fs.createWriteStream(filename));

    var keys = Object.keys(people);
    for(var i = 0; i<keys.length; i++){
      if(people[keys[i]] == id){
        reciever = keys[i];
      }
    }
    console.log('reciever : ' + reciever + 'name : ' + id);
    socketsArr[reciever].emit('fileDownload',filename,ids, people[client.id]);

  })
  client.on('disconnect', function(){
    socket.emit('disconnected', client.id);
  });

  client.on('send_request', function(clientid){
    socketsArr[clientid].emit('client1_request', people[client.id] , client.id);
  })

  client.on('request_accepted', function(id){
    var uniqueid = "";
    var chat_history = [];
    if(people[client.id]< people[id]) {
       uniqueid = people[client.id]+people[id];
       console.log("unique "  +uniqueid)
    }
    else {
      uniqueid = people[id]+people[client.id];
      console.log("unique "  +uniqueid)
    }

    PersonChat.findOne({ 'uniqueid' : uniqueid}, function(err, doc){
    if(doc != null) {
      console.log(JSON.stringify(doc['chat']));
      socketsArr[id].emit('accept_handshake', people[client.id]);
      client.emit('start-chat', people[client.id], people[id], doc['chat']);
      socketsArr[id].emit('start-chat', people[client.id], people[id], doc['chat']);
    }
    else {
      socketsArr[id].emit('accept_handshake', people[client.id]);
      client.emit('start-chat', people[client.id], people[id], chat_history);
      socketsArr[id].emit('start-chat', people[client.id], people[id], chat_history);
    }
  })
  })

})

module.exports = app;

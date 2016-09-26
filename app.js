var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var io = require('socket.io');
var mongoose = require('mongoose');

var PersonChat = require('./models/PersonChatModel')

var userRegister = require('./models/RegisterModel')

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var people = {}; 
var socketsArr = {}; 

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use("/public", express.static(__dirname + "/public"));

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
mongoose.connect('mongodb://localhost/chatappdb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("holla we are connected!!!!!")
});

var socket = io.listen(app.listen(3000));

socket.on('connection', function(client) {

  client.on('join', function(name, pass, phone, email) {
    people[client.id] = name;
    socketsArr[client.id] = client;

    var temp = new userRegister({name : name, password : pass, phone : phone, email : email});
    temp.save(function(err, temp){
      if (err) return console.error(err);
    })
    client.emit("welcome", "Welcome to My chat " + name);
    client.emit("available_people", people)
  }) 

  client.on('send' , function(msg) {
    console.log("before chat evennt");
    socket.sockets.emit('chat', people[client.id], msg);
    ("after chat evennt");
  })

  client.on('disconnect', function(){
    delete people[client.id];
    socket.sockets.emit('people-in-chat', people);
  });

  client.on('send_request', function(clientid){
    console.log(socketsArr);
    socketsArr[clientid].emit('client1_request', people[client.id] , client.id);
  })

  client.on('request_accepted', function(id){
    console.log(client.id +" "+id )
    client.emit('start-chat', people[client.id], people[id]);
    socketsArr[id].emit('start-chat', people[client.id], people[id]);
  })

})

module.exports = app;

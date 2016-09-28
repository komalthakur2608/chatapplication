var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = mongoose.Schema({
    name: String,
    password: String
});

var userRegister = mongoose.model('User', userSchema);

module.exports = userRegister;
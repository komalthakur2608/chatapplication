var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatSchema = mongoose.Schema({
    name: String,
    msg: String
});

var PersonChat = mongoose.model('PersonChat', chatSchema);

module.exports = PersonChat;
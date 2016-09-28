var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatSchema = mongoose.Schema({
    user1: String,
    user2: String,
    uniqueid: String,
    chat : [{
    	sender:String,
    	message:String
    }]
});

var PersonChat = mongoose.model('PersonChat', chatSchema);

module.exports = PersonChat;
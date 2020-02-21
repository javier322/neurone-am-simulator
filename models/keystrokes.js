import mongoose from 'mongoose'


var KeystrokesSchema = new mongoose.Schema({
    username: String,
    keyCode: Number,
    localTimestamp: Number,
    url: String
  });
  
  module.exports = mongoose.model('Keystrokes',KeystrokesSchema,'keystrokes');
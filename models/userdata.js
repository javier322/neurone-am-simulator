import mongoose from 'mongoose'

var UserDataSchema = new mongoose.Schema({
    username: String
  });
  
  module.exports = mongoose.model('UserData',UserDataSchema,'userdata');
import mongoose from 'mongoose'


var QueriesSchema = new mongoose.Schema({
    username: String,
    userId: String,
    query: String,
    localTimestamp: Number,
    url: String
  });
  
  module.exports = mongoose.model('Queries',QueriesSchema,'queries');
import mongoose from 'mongoose'

var BookmarkSchema = new mongoose.Schema({
    username: String,
    localTimestamp: Number,
    action: String,
    docId: String,
    url: String,
    relevant: Boolean
  });
  
  module.exports = mongoose.model('Bookmark',BookmarkSchema,'bookmarks');

import mongoose from 'mongoose'

var VisitedLinkSchema = new mongoose.Schema({
  username: String,
  localTimestamp: Number,
  state: String,
  userId: String,
  url: String
});

module.exports = mongoose.model('VisitedLink',VisitedLinkSchema,'visitedlinks');
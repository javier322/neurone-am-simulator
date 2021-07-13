
var mongoose = require('mongoose');

var SequenceSchema = new mongoose.Schema({

    actual_value: Number

});

module.exports = mongoose.model('Sequence',SequenceSchema);

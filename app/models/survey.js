var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Survey', new Schema({
  type: String,
  data: String
}, { collection: 'survey' }));

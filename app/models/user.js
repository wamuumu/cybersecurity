var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('User', new Schema({
  name: String,
  surname: String,
  email: String,
  password: String,
  role: String,
  organization: String,
  province: String
}, { collection: 'user' }));
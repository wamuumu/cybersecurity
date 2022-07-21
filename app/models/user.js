var mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

var Schema = mongoose.Schema;

const User = new Schema({
  name: String,
  surname: String,
  email: String,
  password: String,
  role: String,
  organization: String,
  province: String
})

User.plugin(passportLocalMongoose);

// set up a mongoose model
module.exports = mongoose.model('User', User, 'user');
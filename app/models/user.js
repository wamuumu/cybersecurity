var mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

var Schema = mongoose.Schema;

const User = new Schema({
  name: String,
  surname: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  role: {
    type: String,
    default: "user"
  },
  organization: String,
  province: String,
  apikey: String
})

User.plugin(passportLocalMongoose, {usernameField: "email"});

// set up a mongoose model
module.exports = mongoose.model('User', User, 'user');

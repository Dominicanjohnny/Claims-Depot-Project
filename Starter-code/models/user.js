const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const userSchema = new Schema({
  email      : String,
  username   : String,
  password   : String,
  description: String,
  insurance  : String,
  claim      : { type: Schema.Types.ObjectId, ref: 'claim' },
  imgUrl     : { type: String, default: "https://placeholdit.imgix.net/~text?txtsize=33&txt=250%C3%97250&w=250&h=250" }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
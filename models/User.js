// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  twoFASecret: { type: String },
  isTwoFAEnabled: { type: Boolean, default: false }
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);

// models/Log.js
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, enum: ["CREATE", "READ", "UPDATE", "DELETE"], required: true },
  entity: { type: String, required: true }, 
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Log || mongoose.model("Log", logSchema);

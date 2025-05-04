// models/Log.js
import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, enum: ["CREATE", "READ", "UPDATE", "DELETE"], required: true },
  entity: { type: String, required: true }, 
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Log || mongoose.model("Log", logSchema);

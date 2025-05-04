import mongoose from "mongoose";

const monitoredUserSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  reason: String,
  detectedAt: { type: Date, default: Date.now },
});

export default mongoose.models.MonitoredUser || mongoose.model("MonitoredUser", monitoredUserSchema);

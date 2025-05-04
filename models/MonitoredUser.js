// models/MonitoredUser.js
import mongoose from 'mongoose';

const monitoredUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
      unique: true,
    },
    reason: {
      type: String,
      required: true,
    },
    flaggedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MonitoredUser = mongoose.models.MonitoredUser || mongoose.model('MonitoredUser', monitoredUserSchema);
export default MonitoredUser;

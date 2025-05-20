// models/monitoredUser.js
import mongoose from 'mongoose';

const monitoredUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  monitoredBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastChecked: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending',
  }
});

// Create a compound index to ensure uniqueness of userId + monitoredBy combination
monitoredUserSchema.index({ userId: 1, monitoredBy: 1 }, { unique: true });

export default mongoose.models.MonitoredUser || mongoose.model('MonitoredUser', monitoredUserSchema);

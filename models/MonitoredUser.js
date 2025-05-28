// models/monitoredUser.js
const mongoose = require('mongoose');

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

monitoredUserSchema.pre('save', async function(next) {
  const User = mongoose.models.User || require('./User');
  const user = await User.findById(this.userId);
  if (user && user.email && user.email.endsWith('@admin.com')) {
    const err = new Error('Admins cannot be monitored');
    err.name = 'AdminMonitorRestriction';
    return next(err);
  }
  next();
});

module.exports = mongoose.models.MonitoredUser || mongoose.model('MonitoredUser', monitoredUserSchema);

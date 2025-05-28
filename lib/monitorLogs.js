import { dbConnect } from "./dbConnect.js";
import Log from "../models/Log.js";
import MonitoredUser from "../models/MonitoredUser.js";
import User from "../models/User.js";

export async function monitorLogs() {
  await dbConnect();

  const timeWindow = 10 * 60 * 1000;
  const now = new Date();
  const threshold = 10; 

  const since = new Date(now - timeWindow);

  const logs = await Log.aggregate([
    { $match: { timestamp: { $gte: since } } },
    { $group: { _id: "$userId", count: { $sum: 1 } } },
    { $match: { count: { $gt: threshold } } }
  ]);

  for (const entry of logs) {
    const userIdStr = String(entry._id);
    const alreadyMonitored = await MonitoredUser.findOne({ userId: userIdStr });
    // Fetch user to check if admin
    const user = await User.findById(userIdStr);
    if (user && user.email && user.email.endsWith("@admin.com")) {
      continue; // skip admins
    }
    if (!alreadyMonitored) {
      await MonitoredUser.create({
        userId: userIdStr,
        monitoredBy: 'system',
        // no reason field
      });
      console.log(`User ${userIdStr} flagged for suspicious activity.`);
    }
  }
}

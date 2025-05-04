import dbConnect from "./dbConnect.js";
import Log from "../models/Log.js";
import MonitoredUser from "../models/monitoredUser.js";

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
    const alreadyMonitored = await MonitoredUser.findOne({ userId: entry._id });
    if (!alreadyMonitored) {
      await MonitoredUser.create({
        userId: entry._id,
        reason: `High activity: ${entry.count} actions in 10 min`,
      });
      console.log(`User ${entry._id} flagged for suspicious activity.`);
    }
  }
}

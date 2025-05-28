import { NextResponse } from 'next/server';
import {dbConnect} from '../../../lib/dbConnect';
import MonitoredUser from '../../../models/MonitoredUser';
import User from '../../../models/User';
import { getCurrentUser } from '../../../lib/auth';

export async function GET(req) {
  await dbConnect();

  const currentUser = await getCurrentUser(req);
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const monitored = await MonitoredUser.find();
  const monitoredWithEmail = await Promise.all(
    monitored.map(async (mu) => {
      let email = 'Unknown';
      if (mu.userId) {
        try {
          const user = await User.findById(mu.userId);
          if (user) email = user.email;
          else console.warn(`No user found for userId: ${mu.userId}`);
        } catch (e) {
          console.warn(`Error looking up user for userId: ${mu.userId}`, e);
        }
      }
      let detectedAt = mu.createdAt || mu.lastChecked || null;
      let detectedAtString = detectedAt && !isNaN(new Date(detectedAt)) ? new Date(detectedAt).toISOString() : 'Unknown';
      return {
        _id: mu._id,
        userId: mu.userId,
        email,
        detectedAt: detectedAtString,
        monitoredBy: mu.monitoredBy,
        status: mu.status,
        createdAt: mu.createdAt,
        lastChecked: mu.lastChecked,
      };
    })
  );
  return NextResponse.json(monitoredWithEmail);
}

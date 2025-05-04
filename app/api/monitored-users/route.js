import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import MonitoredUser from '../../../models/monitoredUser';
import { getCurrentUser } from '../../../lib/auth';

export async function GET(req) {
  await dbConnect();

  const currentUser = await getCurrentUser(req);
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const monitored = await MonitoredUser.find().populate("userId", "email");
  return NextResponse.json(monitored);
}

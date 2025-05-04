import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/dbConnect";
import LogEntry from "../../../models/Log";
import { getCurrentUser } from "../../../lib/auth";

export async function GET(req) {
  await dbConnect();
  const currentUser = await getCurrentUser(req);

  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const logs = await LogEntry.find()
  .sort({ timestamp: -1 })
  .populate("userId", "email");
  return NextResponse.json(logs);
}

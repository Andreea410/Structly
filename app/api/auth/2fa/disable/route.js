const User = require('../../../../../models/User');
import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../../lib/dbConnect';
import { getCurrentUser } from '../../../../../lib/auth';

export async function POST(req) {
  await dbConnect();
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  currentUser.twoFASecret = undefined;
  currentUser.isTwoFAEnabled = false;
  await currentUser.save();

  return NextResponse.json({ success: true });
} 
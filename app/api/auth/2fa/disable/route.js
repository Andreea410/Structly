const User = require('../../../../../models/User');
import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../../lib/dbConnect';
import { getCurrentUser } from '../../../../../lib/auth';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  await dbConnect();
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  currentUser.twoFASecret = undefined;
  currentUser.isTwoFAEnabled = false;
  await currentUser.save();

  // Generate new JWT token with updated 2FA status
  const payload = {
    id: currentUser._id,
    email: currentUser.email,
    role: currentUser.role,
    isTwoFAEnabled: false
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  return NextResponse.json({ success: true, token });
} 
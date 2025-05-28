import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
const User = require('../../../../../models/User');
import { dbConnect } from '../../../../../lib/dbConnect';
import { getCurrentUser } from '../../../../../lib/auth';

export async function POST(req) {
  await dbConnect();
  const { token } = await req.json();
  const currentUser = await getCurrentUser(req);
  if (!currentUser || !currentUser.isTwoFAEnabled) {
    return NextResponse.json({ error: '2FA not enabled' }, { status: 400 });
  }

  const verified = speakeasy.totp.verify({
    secret: currentUser.twoFASecret,
    encoding: 'base32',
    token
  });

  if (!verified) {
    return NextResponse.json({ error: 'Invalid 2FA token' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
} 
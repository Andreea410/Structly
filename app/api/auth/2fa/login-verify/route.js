const User = require('../../../../../models/User');
const jwt = require('jsonwebtoken');
import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import { dbConnect } from '../../../../../lib/dbConnect';

export async function POST(req) {
  await dbConnect();
  const { userId, token } = await req.json();
  const user = await User.findById(userId);
  if (!user || !user.isTwoFAEnabled) {
    return NextResponse.json({ error: '2FA not enabled' }, { status: 400 });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFASecret,
    encoding: 'base32',
    token
  });

  if (!verified) {
    return NextResponse.json({ error: 'Invalid 2FA token' }, { status: 400 });
  }

  const secret = process.env.JWT_SECRET;
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };
  const jwtToken = jwt.sign(payload, secret, { expiresIn: '1h' });
  return NextResponse.json({ token: jwtToken, user: payload });
} 
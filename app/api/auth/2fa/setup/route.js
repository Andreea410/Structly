import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
const User = require('../../../../../models/User');
import { dbConnect } from '../../../../../lib/dbConnect';
import { getCurrentUser } from '../../../../../lib/auth';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  await dbConnect();
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const secret = speakeasy.generateSecret({ name: `Structly (${currentUser.email})` });
  const qr = await qrcode.toDataURL(secret.otpauth_url);

  // Save secret to user (optionally encrypt)
  currentUser.twoFASecret = secret.base32;
  currentUser.isTwoFAEnabled = true;
  await currentUser.save();

  // Generate new JWT token with updated 2FA status
  const payload = {
    id: currentUser._id,
    email: currentUser.email,
    role: currentUser.role,
    isTwoFAEnabled: true
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  return NextResponse.json({ qr, secret: secret.base32, token });
} 
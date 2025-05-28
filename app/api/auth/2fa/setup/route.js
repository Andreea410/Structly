import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
const User = require('../../../../../models/User');
import { dbConnect } from '../../../../../lib/dbConnect';
import { getCurrentUser } from '../../../../../lib/auth';

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

  return NextResponse.json({ qr, secret: secret.base32 });
} 
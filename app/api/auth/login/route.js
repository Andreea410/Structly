import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../../../models/User';
import { dbConnect } from '../../../../lib/dbConnect';

export async function POST(req) {
  await dbConnect();

  const { email, password } = await req.json();
  const user = await User.findOne({ email });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }

  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, secret, { expiresIn: '1h' });

  return NextResponse.json({ token, user: payload }, { status: 200 });
}

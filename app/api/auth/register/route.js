// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '../../../../models/User';
import { dbConnect } from '../../../../lib/dbConnect';

export async function POST(req) {
  await dbConnect();
  const { email, username, password } = await req.json();

  const existing = await User.findOne({ email });
  if (existing) return NextResponse.json({ error: 'Email already used' }, { status: 409 });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, username, password: hashed });

  return NextResponse.json({ message: 'Registered successfully' }, { status: 201 });
}

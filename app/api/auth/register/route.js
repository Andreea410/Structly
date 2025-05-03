// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '../../../../models/User';
import { dbConnect } from '../../../../lib/dbConnect';

export async function POST(req) {
  await dbConnect();

  const { email, username, password } = await req.json();

  if (!email || !username || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const role = email.endsWith("@admin.com") ? "admin" : "user";

  const user = await User.create({
    email,
    username,
    password: hashedPassword,
    role,
  });

  return NextResponse.json({
    message: "User created successfully",
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  });
}

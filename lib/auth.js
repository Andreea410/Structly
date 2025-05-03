// lib/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { cookies } from 'next/headers'; 

const SECRET = process.env.JWT_SECRET;

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) throw new Error("Not authenticated");

  const decoded = jwt.verify(token, SECRET);
  const user = await User.findById(decoded.userId);

  if (!user) throw new Error("User not found");
  return user;
}

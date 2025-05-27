import jwt from 'jsonwebtoken';
import User from '../models/User';
import { dbConnect } from './dbConnect';
import { cookies } from 'next/headers';

export async function getCurrentUser(req) {
  await dbConnect();
  const token = req.cookies.get('token')?.value;
  if (!token) throw new Error('No token provided');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');
    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    throw error;
  }
}

export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(token) {
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 // 24 hours
  });
}

export async function clearAuthCookie() {
  cookies().delete('token');
}

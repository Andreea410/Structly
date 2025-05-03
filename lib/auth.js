// lib/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User';

export async function getCurrentUser(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('No token');

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  return user;
}

import jwt from 'jsonwebtoken';
import User from '../models/User';
import { dbConnect } from './dbConnect';

export async function getCurrentUser(req) {
  await dbConnect();
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.split(' ')[1];
  if (!token) throw new Error('No token provided');

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) throw new Error('User not found');

  return user;
}

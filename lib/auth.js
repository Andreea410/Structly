const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { dbConnect } = require('./dbConnect');
const { cookies } = require('next/headers');

async function getCurrentUser(req) {
  await dbConnect();
  let token = null;

  // Try to get token from cookies (Next.js API)
  if (req.cookies && typeof req.cookies.get === 'function') {
    token = req.cookies.get('token')?.value;
  }

  // Try to get token from Authorization header
  if (!token && req.headers && typeof req.headers.get === 'function') {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) throw new Error('No token provided');

  try {
    console.log('Verifying token with secret:', process.env.JWT_SECRET ? 'Set' : 'Not set');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');
    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    throw error;
  }
}

async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

async function setAuthCookie(token) {
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 // 24 hours
  });
}

async function clearAuthCookie() {
  cookies().delete('token');
}

module.exports = {
  getCurrentUser,
  verifyToken,
  setAuthCookie,
  clearAuthCookie
};

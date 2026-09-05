// src/services/authService.js
import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const loginService = async (loginData) => {
  const { username, email, password } = loginData;
  const identifier = username || email;

  // 1. Validate required input fields
  if (!identifier || !password) {
    const error = new Error('Missing credentials');
    error.statusCode = 400;
    error.errorCode = 'MISSING_CREDENTIALS'; // 👈 Missing credentials error code
    throw error;
  }

  // 2. Search for user by username or email
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { name: identifier },
        { email: identifier }
      ]
    }
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.errorCode = 'USER_NOT_FOUND'; // 👈 User not found error code
    throw error;
  }

  // 3. Verify password match
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    const error = new Error('Invalid password');
    error.statusCode = 400;
    error.errorCode = 'INVALID_PASSWORD'; // 👈 Invalid password error code
    throw error;
  }

  // 4. Generate JWT Token
  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: '1d' }
  );

  return {
    token,
    role: user.role.toLowerCase(),
    user: {
      id: user.id,
      name: user.name,
      role: user.role
    }
  };
};
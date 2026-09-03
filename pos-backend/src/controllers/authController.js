import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  const { username, email, password } = req.body;
  
  // Accept either username or email sent from the frontend
  const identifier = username || email;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Please enter username/email and password' });
  }

  try {
    // Search for user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: identifier },
          { email: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1d' }
    );

    // Return response compatible with frontend (returns role directly and converted to lowercase)
    res.json({
      message: 'Login successful',
      token,
      role: user.role.toLowerCase(), // Fixed variable reference and converted role to lowercase
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during login', details: error.message });
  }
};
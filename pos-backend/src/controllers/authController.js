// src/controllers/authController.js
import { loginService } from '../services/authService.js';

export const login = async (req, res) => {
  try {
    // Pass req.body to the service layer
    const result = await loginService(req.body);

    return res.json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || 'An error occurred during login',
      details: error.statusCode ? undefined : error.message
    });
  }
};
const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authenticateUser } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');

// Register user
router.post('/register-34475338', validateUserRegistration, async (req, res) => {
  const result = await authService.register(req.body);
  const statusCode = result.ok ? 201 : (result.error.includes('already') ? 409 : 400);
  res.status(statusCode).json(result);
});

// Login user
router.post('/login-34475338', validateUserLogin, async (req, res) => {
  const result = await authService.login(req.body);
  const statusCode = result.ok ? 200 : 401;
  res.status(statusCode).json(result);
});

// Get user by ID
router.get('/me-34475338', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ ok: false, error: 'User ID is required' });
  }
  
  const result = await authService.getUserById(userId);
  const statusCode = result.ok ? 200 : 404;
  res.status(statusCode).json(result);
});

module.exports = router;

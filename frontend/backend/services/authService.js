const User = require('../models/user');
const { generateNextUserId } = require('../utils/idGenerator');
const { successResponse, formatErrorResponse } = require('../utils/helpers');

class AuthService {
  async register(userData) {
    try {
      const { fullname, email, password, role = 'user', phone } = userData;
      
      // Check if user already exists
      const exists = await User.findOne({ email });
      if (exists) {
        return { ok: false, error: 'Email already registered' };
      }
      
      // Generate userId
      const userId = await generateNextUserId();
      
      // Create new user
      const newUser = new User({ userId, fullname, email, password, role, phone });
      await newUser.save();
      
      return successResponse({}, 'User registered successfully! Please log in.');
    } catch (error) {
      return formatErrorResponse(error);
    }
  }

  async login(credentials) {
    try {
      const { email, password } = credentials;
      
      const user = await User.findOne({ email });
      if (!user) {
        return { ok: false, error: 'Invalid credentials' };
      }
      
      if (user.password !== password) {
        return { ok: false, error: 'Invalid credentials' };
      }
      
      return successResponse({ user }, 'Login successful');
    } catch (error) {
      return formatErrorResponse(error);
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findOne({ userId });
      if (!user) {
        return { ok: false, error: 'User not found' };
      }
      
      return successResponse({ user });
    } catch (error) {
      return formatErrorResponse(error);
    }
  }
}

module.exports = new AuthService();

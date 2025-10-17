const express = require('express');
const router = express.Router();
const Recipe = require('../models/recipe');
const Inventory = require('../models/inventory');
const User = require('../models/user');
const { successResponse, formatErrorResponse } = require('../utils/helpers');

// Get dashboard statistics
router.get('/stats-34475338', async (req, res) => {
  try {
    const [recipes, inventory, users] = await Promise.all([
      Recipe.countDocuments(),
      Inventory.countDocuments(),
      User.countDocuments()
    ]);
    
    const result = successResponse({ recipes, inventory, users });
    res.status(200).json(result);
  } catch (error) {
    const result = formatErrorResponse(error, 'Failed to fetch statistics');
    res.status(500).json(result);
  }
});

module.exports = router;

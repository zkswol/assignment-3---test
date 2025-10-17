const { PASSWORD_PATTERN, PHONE_PATTERN, FULLNAME_PATTERN } = require('../config/constants');

// Custom validation functions
const validateUserRegistration = (req, res, next) => {
  const { fullname, email, password, role, phone } = req.body;
  const errors = [];

  // Validate fullname
  if (!fullname || typeof fullname !== 'string') {
    errors.push('Full name is required');
  } else if (fullname.length < 2 || fullname.length > 100) {
    errors.push('Full name must be between 2 and 100 characters');
  } else if (!FULLNAME_PATTERN.test(fullname)) {
    errors.push('Full name can only contain letters, spaces, hyphens, and apostrophes');
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Valid email is required');
  }

  // Validate password
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else if (!PASSWORD_PATTERN.test(password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
  }

  // Validate role (optional)
  if (role && !['admin', 'chef', 'manager', 'user'].includes(role)) {
    errors.push('Invalid role');
  }

  // Validate phone (optional)
  if (phone && !PHONE_PATTERN.test(phone)) {
    errors.push('Please enter a valid Australian phone number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ ok: false, error: errors[0] });
  }

  next();
};

const validateUserLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Valid email is required');
  }

  // Validate password
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ ok: false, error: errors[0] });
  }

  next();
};

const validateRecipe = (req, res, next) => {
  const { title, chef, cuisineType, mealType, prepTime, difficulty, servings, ingredients, instructions } = req.body;
  const errors = [];

  // Validate title
  if (!title || typeof title !== 'string') {
    errors.push('Recipe title is required');
  } else if (title.length < 3 || title.length > 50) {
    errors.push('Title must be between 3 and 50 characters');
  }

  // Validate chef
  if (!chef || typeof chef !== 'string') {
    errors.push('Chef name is required');
  } else if (chef.length < 2 || chef.length > 50) {
    errors.push('Chef name must be between 2 and 50 characters');
  } else if (!FULLNAME_PATTERN.test(chef)) {
    errors.push('Chef name can only contain letters, spaces, hyphens, and apostrophes');
  }

  // Validate cuisineType
  if (!cuisineType || typeof cuisineType !== 'string') {
    errors.push('Cuisine type is required');
  }

  // Validate mealType
  if (!mealType || typeof mealType !== 'string') {
    errors.push('Meal type is required');
  }

  // Validate prepTime
  if (!prepTime || isNaN(prepTime) || prepTime < 1 || prepTime > 480) {
    errors.push('Prep time must be between 1 and 480 minutes');
  }

  // Validate difficulty
  if (!difficulty || !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
    errors.push('Difficulty must be Easy, Medium, or Hard');
  }

  // Validate servings
  if (!servings || isNaN(servings) || servings < 1 || servings > 20) {
    errors.push('Servings must be between 1 and 20');
  }

  // Validate ingredients
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    errors.push('At least one ingredient is required');
  }

  // Validate instructions
  if (!instructions || !Array.isArray(instructions) || instructions.length === 0) {
    errors.push('At least one instruction is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ ok: false, error: errors[0] });
  }

  next();
};

const validateInventoryItem = (req, res, next) => {
  const { ingredientName, quantity, unit, category, purchaseDate, expirationDate, location, cost } = req.body;
  const errors = [];

  // Validate ingredientName
  if (!ingredientName || typeof ingredientName !== 'string') {
    errors.push('Ingredient name is required');
  } else if (ingredientName.length < 2 || ingredientName.length > 100) {
    errors.push('Ingredient name must be between 2 and 100 characters');
  }

  // Validate quantity
  if (!quantity || isNaN(quantity) || parseFloat(quantity) < 0.1) {
    errors.push('Quantity must be at least 0.1');
  }

  // Validate unit
  if (!unit || typeof unit !== 'string') {
    errors.push('Unit is required');
  }

  // Validate category
  if (!category || typeof category !== 'string') {
    errors.push('Category is required');
  }

  // Validate purchaseDate
  if (!purchaseDate || isNaN(Date.parse(purchaseDate))) {
    errors.push('Valid purchase date is required');
  }

  // Validate expirationDate
  if (!expirationDate || isNaN(Date.parse(expirationDate))) {
    errors.push('Valid expiration date is required');
  }

  // Validate location
  if (!location || typeof location !== 'string') {
    errors.push('Location is required');
  }

  // Validate cost
  if (cost === undefined || cost === null || isNaN(cost) || parseFloat(cost) < 0) {
    errors.push('Cost must be non-negative');
  }

  if (errors.length > 0) {
    return res.status(400).json({ ok: false, error: errors[0] });
  }

  next();
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateRecipe,
  validateInventoryItem
};

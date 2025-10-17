const express = require('express');
const router = express.Router();
const recipeService = require('../services/recipeService');
const { authenticateUser, requireChef } = require('../middleware/auth');
const { validateRecipe } = require('../middleware/validation');

// Get all recipes
router.get('/view-recipes-34475338', authenticateUser, requireChef, async (req, res) => {
  const { ownerId } = req.query;
  const result = await recipeService.getRecipes(req.user.userId, ownerId);
  const statusCode = result.ok ? 200 : 500;
  res.status(statusCode).json(result);
});

// Create new recipe
router.post('/add-recipe-34475338', authenticateUser, requireChef, validateRecipe, async (req, res) => {
  const recipeData = { ...req.body, userId: req.user.userId };
  const result = await recipeService.createRecipe(recipeData);
  const statusCode = result.ok ? 201 : (result.error.includes('already exists') ? 400 : 500);
  res.status(statusCode).json(result);
});

// Update recipe
router.put('/edit-recipe-34475338', authenticateUser, requireChef, async (req, res) => {
  const { recipeId, ...updateData } = req.body;
  const result = await recipeService.updateRecipe(recipeId, updateData, req.user.userId);
  const statusCode = result.ok ? 200 : (result.error.includes('not found') ? 404 : 
    result.error.includes('do not own') ? 403 : 500);
  res.status(statusCode).json(result);
});

// Delete recipe
router.delete('/delete-recipe-34475338/:id', authenticateUser, requireChef, async (req, res) => {
  const { id: recipeId } = req.params;
  const result = await recipeService.deleteRecipe(recipeId, req.user.userId);
  const statusCode = result.ok ? 204 : (result.error.includes('not found') ? 404 : 
    result.error.includes('do not own') ? 403 : 500);
  
  if (result.ok) {
    res.sendStatus(statusCode);
  } else {
    res.status(statusCode).json(result);
  }
});

module.exports = router;

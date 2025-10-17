const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { authenticateUser } = require('../middleware/auth');

// Analyze recipe health
router.post('/analyze-recipe-health-34475338', authenticateUser, async (req, res) => {
  const { recipeId } = req.body;
  const result = await aiService.analyzeRecipeHealth(recipeId);
  const statusCode = result.ok ? 200 : (result.error.includes('not found') ? 404 : 500);
  res.status(statusCode).json(result);
});

// Translate recipe
router.post('/translate-recipe-34475338', authenticateUser, async (req, res) => {
  const { recipeId, targetLanguage } = req.body;
  const result = await aiService.translateRecipe(recipeId, targetLanguage);
  const statusCode = result.ok ? 200 : (result.error.includes('not found') ? 404 : 
    result.error.includes('required') ? 400 : 500);
  res.status(statusCode).json(result);
});

// Translate generic text
router.post('/translate-text-34475338', async (req, res) => {
  const { text, targetLanguage } = req.body;
  const result = await aiService.translateText(text, targetLanguage);
  const statusCode = result.ok ? 200 : 400;
  res.status(statusCode).json(result);
});

module.exports = router;

function toInstructionArray(instructions) {
  if (Array.isArray(instructions)) return instructions;
  if (typeof instructions === 'string') return instructions.split('\n').filter(s => s.trim());
  return [];
}

async function findRecipeById(id) {
  const Recipe = require('../models/recipe');
  return await Recipe.findOne({ recipeId: id });
}

function formatErrorResponse(error, defaultMessage = 'An error occurred') {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(e => e.message);
    return { ok: false, error: errors[0] };
  }
  
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return { ok: false, error: `${field} already exists` };
  }
  
  return { ok: false, error: error.message || defaultMessage };
}

function successResponse(data, message = 'Success') {
  return { ok: true, message, ...data };
}

module.exports = {
  toInstructionArray,
  findRecipeById,
  formatErrorResponse,
  successResponse
};

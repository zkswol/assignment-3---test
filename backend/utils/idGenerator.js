const User = require('../models/user');
const Recipe = require('../models/recipe');
const Inventory = require('../models/inventory');
const { ID_PREFIXES } = require('../config/constants');

async function generateNextUserId() {
  const lastUser = await User.findOne().sort({ userId: -1 });
  if (!lastUser || !lastUser.userId) {
    return `${ID_PREFIXES.USER}00001`;
  }
  
  const maxId = parseInt(lastUser.userId.substring(2), 10);
  const paddedId = String(maxId + 1).padStart(5, '0');
  return `${ID_PREFIXES.USER}${paddedId}`;
}

async function generateNextRecipeId() {
  const lastRecipe = await Recipe.findOne().sort({ recipeId: -1 });
  if (!lastRecipe || !lastRecipe.recipeId) {
    return `${ID_PREFIXES.RECIPE}00001`;
  }
  
  const maxId = parseInt(lastRecipe.recipeId.substring(2), 10);
  const paddedId = String(maxId + 1).padStart(5, '0');
  return `${ID_PREFIXES.RECIPE}${paddedId}`;
}

async function generateNextInventoryId() {
  const lastInventory = await Inventory.findOne().sort({ inventoryId: -1 });
  if (!lastInventory || !lastInventory.inventoryId) {
    return `${ID_PREFIXES.INVENTORY}00001`;
  }
  
  const maxId = parseInt(lastInventory.inventoryId.substring(2), 10);
  const paddedId = String(maxId + 1).padStart(5, '0');
  return `${ID_PREFIXES.INVENTORY}${paddedId}`;
}

module.exports = {
  generateNextUserId,
  generateNextRecipeId,
  generateNextInventoryId
};

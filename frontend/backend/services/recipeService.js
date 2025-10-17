const Recipe = require('../models/recipe');
const { generateNextRecipeId } = require('../utils/idGenerator');
const { toInstructionArray, findRecipeById, successResponse, formatErrorResponse } = require('../utils/helpers');

class RecipeService {
  async createRecipe(recipeData) {
    try {
      const {
        userId, title, chef, ingredients, instructions,
        mealType, cuisineType, prepTime, difficulty, servings
      } = recipeData;

      // Check for duplicate title per chef
      const existing = await Recipe.findOne({
        chef: { $regex: new RegExp(`^${chef}$`, 'i') },
        title: { $regex: new RegExp(`^${title}$`, 'i') }
      });
      
      if (existing) {
        return { ok: false, error: 'A recipe with this title already exists for this chef' };
      }

      // Generate recipe ID
      const recipeId = await generateNextRecipeId();

      const recipe = new Recipe({
        recipeId,
        userId,
        ownerId: userId,
        title,
        chef,
        ingredients,
        instructions: toInstructionArray(instructions),
        mealType,
        cuisineType,
        prepTime,
        difficulty,
        servings,
        createdDate: new Date()
      });

      await recipe.save();
      
      // Format createdDate to show only date part
      const formattedRecipe = {
        ...recipe.toObject(),
        createdDate: recipe.createdDate ? new Date(recipe.createdDate).toISOString().split('T')[0] : null
      };
      
      return successResponse({ recipe: formattedRecipe });
    } catch (error) {
      return formatErrorResponse(error);
    }
  }

  async getRecipes(userId, ownerId = null) {
    try {
      const filter = ownerId ? { ownerId } : {};
      const recipes = await Recipe.find(filter).sort({ createdAt: -1 });
      
      // Format createdDate to show only date part
      const formattedRecipes = recipes.map(recipe => ({
        ...recipe.toObject(),
        createdDate: recipe.createdDate ? new Date(recipe.createdDate).toISOString().split('T')[0] : null
      }));
      
      return successResponse({ recipes: formattedRecipes });
    } catch (error) {
      return formatErrorResponse(error);
    }
  }

  async getRecipeById(recipeId) {
    try {
      const recipe = await findRecipeById(recipeId);
      if (!recipe) {
        return { ok: false, error: 'Recipe not found' };
      }
      
      // Format createdDate to show only date part
      const formattedRecipe = {
        ...recipe.toObject(),
        createdDate: recipe.createdDate ? new Date(recipe.createdDate).toISOString().split('T')[0] : null
      };
      
      return successResponse({ recipe: formattedRecipe });
    } catch (error) {
      return formatErrorResponse(error);
    }
  }

  async updateRecipe(recipeId, updateData, userId) {
    try {
      const recipe = await findRecipeById(recipeId);
      if (!recipe) {
        return { ok: false, error: 'Recipe not found' };
      }

      // Check ownership
      if (String(recipe.ownerId) !== String(userId)) {
        return { ok: false, error: 'You do not own this recipe' };
      }

      // Check for duplicate title excluding current recipe
      if (updateData.title && updateData.chef) {
        const dup = await Recipe.findOne({
          chef: { $regex: new RegExp(`^${updateData.chef}$`, 'i') },
          title: { $regex: new RegExp(`^${updateData.title}$`, 'i') },
          _id: { $ne: recipe._id }
        });
        
        if (dup) {
          return { ok: false, error: 'A recipe with this title already exists for this chef' };
        }
      }

      // Prepare update document
      const updateDoc = {
        ...(updateData.title !== undefined && { title: updateData.title }),
        ...(updateData.chef !== undefined && { chef: updateData.chef }),
        ...(updateData.cuisineType !== undefined && { cuisineType: updateData.cuisineType }),
        ...(updateData.mealType !== undefined && { mealType: updateData.mealType }),
        ...(updateData.prepTime !== undefined && { prepTime: updateData.prepTime }),
        ...(updateData.difficulty !== undefined && { difficulty: updateData.difficulty }),
        ...(updateData.servings !== undefined && { servings: updateData.servings }),
        ...(updateData.ingredients !== undefined && { 
          ingredients: Array.isArray(updateData.ingredients) 
            ? updateData.ingredients 
            : Object.values(updateData.ingredients || {}) 
        }),
        ...(updateData.instructions !== undefined && { 
          instructions: toInstructionArray(updateData.instructions) 
        })
      };

      const updated = await Recipe.findByIdAndUpdate(
        recipe._id, 
        { $set: updateDoc }, 
        { new: true, runValidators: true }
      );
      
      // Format createdDate to show only date part
      const formattedRecipe = {
        ...updated.toObject(),
        createdDate: updated.createdDate ? new Date(updated.createdDate).toISOString().split('T')[0] : null
      };
      
      return successResponse({ recipe: formattedRecipe });
    } catch (error) {
      return formatErrorResponse(error);
    }
  }

  async deleteRecipe(recipeId, userId) {
    try {
      const recipe = await findRecipeById(recipeId);
      if (!recipe) {
        return { ok: false, error: 'Recipe not found' };
      }

      // Check ownership
      if (String(recipe.ownerId) !== String(userId)) {
        return { ok: false, error: 'You do not own this recipe' };
      }

      await Recipe.deleteOne({ _id: recipe._id });
      return { ok: true, message: 'Recipe deleted successfully' };
    } catch (error) {
      return formatErrorResponse(error);
    }
  }
}

module.exports = new RecipeService();

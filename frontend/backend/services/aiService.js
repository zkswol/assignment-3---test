const { ai, translate, ttsClient } = require('../config/google-services');
const { findRecipeById } = require('../utils/helpers');
const { successResponse, formatErrorResponse } = require('../utils/helpers');

class AIService {
  async analyzeRecipeHealth(recipeId) {
    try {
      const recipe = await findRecipeById(recipeId);
      if (!recipe) {
        return { ok: false, error: 'Recipe not found' };
      }

      // Prepare ingredients list for AI analysis
      const ingredientsList = recipe.ingredients.map(ing => 
        `${ing.quantity} ${ing.name}`
      ).join(', ');
      
      // Create prompt for AI analysis
      const prompt = `Analyze the healthiness of this recipe and provide suggestions for improvement. 
      
      Recipe: ${recipe.title}
      Ingredients: ${ingredientsList}
      Servings: ${recipe.servings}
      Meal Type: ${recipe.mealType}
      
      Please provide:
      1. A health score from 1-10 (10 being healthiest)
      2. Main health concerns (high sodium, saturated fat, etc.)
      3. Specific improvement suggestions with healthier alternatives
      4. Overall nutritional assessment
      
      Format your response in a clear, structured way that can be displayed in a web interface.`;

      // Call Gemini AI
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const analysis = response.text;

      return successResponse({
        analysis,
        recipe: {
          title: recipe.title,
          ingredients: recipe.ingredients,
          servings: recipe.servings,
          mealType: recipe.mealType
        }
      });
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return { 
        ok: false, 
        error: 'Failed to analyze recipe health. Please try again later.' 
      };
    }
  }

  async translateRecipe(recipeId, targetLanguage) {
    try {
      const recipe = await findRecipeById(recipeId);
      if (!recipe) {
        return { ok: false, error: 'Recipe not found' };
      }

      if (!targetLanguage) {
        return { ok: false, error: 'Target language is required' };
      }

      const translated = {};
      const textsToTranslate = [];
      const map = [];

      // Translate title
      if (recipe.title) {
        map.push({ kind: 'title' });
        textsToTranslate.push(recipe.title);
      }

      // Translate instructions
      if (recipe.instructions && recipe.instructions.length > 0) {
        const instructionText = Array.isArray(recipe.instructions) 
          ? recipe.instructions.join('\n') 
          : recipe.instructions;
        map.push({ kind: 'instructions' });
        textsToTranslate.push(instructionText);
      }

      // Translate ingredient names while preserving quantities
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach((ingredient, idx) => {
          if (typeof ingredient === 'string') {
            map.push({ kind: 'ingredient_string', idx });
            textsToTranslate.push(ingredient);
          } else if (ingredient && ingredient.name) {
            map.push({ kind: 'ingredient_obj', idx });
            textsToTranslate.push(String(ingredient.name));
          }
        });
      }

      if (textsToTranslate.length === 0) {
        return { ok: false, error: 'No content to translate' };
      }

      // Call Google Translate API
      const [translationsRaw] = await translate.translate(textsToTranslate, { 
        to: targetLanguage, 
        format: 'text' 
      });
      
      const translations = Array.isArray(translationsRaw) ? translationsRaw : [translationsRaw];

      // Reconstruct the translated content
      let i = 0;
      
      if (recipe.title) {
        translated.title = translations[i++];
      }
      
      if (recipe.instructions && recipe.instructions.length > 0) {
        translated.instructions = translations[i++];
      }
      
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        translated.ingredients = [];
        recipe.ingredients.forEach((ingredient, idx) => {
          const mapItem = map.find(m => 
            (m.kind === 'ingredient_string' || m.kind === 'ingredient_obj') && m.idx === idx
          );
          
          if (!mapItem) {
            translated.ingredients.push(ingredient);
            return;
          }
          
          const translatedName = translations[i++];
          
          if (typeof ingredient === 'string') {
            translated.ingredients.push(translatedName);
          } else {
            translated.ingredients.push({
              name: translatedName,
              quantity: ingredient.quantity || ''
            });
          }
        });
      }

      return successResponse({
        translated,
        originalLanguage: 'en',
        targetLanguage,
        recipe: {
          title: recipe.title,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions
        }
      });
    } catch (error) {
      console.error('Translation Error:', error);
      return { 
        ok: false, 
        error: 'Failed to translate recipe. Please try again later.' 
      };
    }
  }

  async translateText(text, targetLanguage) {
    try {
      if (!text || !targetLanguage) {
        return { ok: false, error: 'text and targetLanguage are required' };
      }

      const [translated] = await translate.translate(text, { 
        to: targetLanguage, 
        format: 'text' 
      });
      
      return successResponse({ 
        translated: Array.isArray(translated) ? translated.join('\n') : translated 
      });
    } catch (error) {
      console.error('Translate Text Error:', error);
      return { ok: false, error: 'Failed to translate text' };
    }
  }

  async synthesizeSpeech(text) {
    try {
      if (!text || !text.trim()) {
        return { ok: false, error: 'No text provided' };
      }

      const request = {
        input: { text },
        voice: { languageCode: 'en-US', name: 'en-US-Standard-C' },
        audioConfig: { audioEncoding: 'MP3' }
      };

      const [response] = await ttsClient.synthesizeSpeech(request);
      const audioContent = response.audioContent || Buffer.from('');
      const base64 = Buffer.from(audioContent).toString('base64');
      const dataUrl = `data:audio/mpeg;base64,${base64}`;
      
      return successResponse({ audioDataUrl: dataUrl });
    } catch (error) {
      console.error('TTS Error:', error);
      return { ok: false, error: 'Failed to synthesize speech' };
    }
  }
}

module.exports = new AIService();

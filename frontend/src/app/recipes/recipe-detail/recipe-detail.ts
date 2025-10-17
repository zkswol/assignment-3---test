import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RecipeService, Recipe } from '../../services/recipe.service';
import { AuthService } from '../../services/auth.service';
import { AiService, HealthAnalysis } from '../../services/ai.service';
import { TranslationService, TranslationResponse } from '../../services/translation.service';
import { TtsSocketService } from '../../services/tts-socket.service';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, MarkdownPipe],
  templateUrl: './recipe-detail.html',
  styleUrls: ['./recipe-detail.css']
})
export class RecipeDetail implements OnInit {
  private modalService = inject(NgbModal);
  
  recipe: Recipe | null = null;
  loading = false;
  error = '';
  userId: string | null | undefined = null;
  
  // AI Health Analysis properties
  healthAnalysis: HealthAnalysis | null = null;
  analyzingHealth = false;
  healthError = '';

  // TTS state
  ttsLoading = false;
  ttsError = '';
  ttsAudioUrl: string | null = null;

  // Translation properties
  languages = [
    { code: 'en', label: 'English' },
    { code: 'zh-CN', label: '中文（简体）' },
    { code: 'ja', label: '日本語' },
    { code: 'fr', label: 'Français' }
  ];

  labels: any = {
    en: { 
      ingredients: 'Ingredients', 
      instructions: 'Instructions',
      title: 'Recipe Details',
      cuisineType: 'Cuisine Type',
      mealType: 'Meal Type',
      prepTime: 'Prep Time',
      difficulty: 'Difficulty',
      servings: 'Servings',
      created: 'Created',
      ingredientCol: 'Ingredient',
      quantityCol: 'Quantity',
      analyzeHealth: 'Analyze Health',
      clear: 'Clear',
      translate: 'Translate Recipe',
      original: 'Original',
      translated: 'Translated',
      by: 'by',
      minutes: 'minutes'
    },
    'zh-CN': { 
      ingredients: '配料', 
      instructions: '步骤',
      title: '食谱详情',
      cuisineType: '菜系类型',
      mealType: '餐食类型',
      prepTime: '准备时间',
      difficulty: '难度',
      servings: '份量',
      created: '创建时间',
      ingredientCol: '配料',
      quantityCol: '数量',
      analyzeHealth: '健康分析',
      clear: '清除',
      translate: '翻译食谱',
      original: '原文',
      translated: '译文',
      by: '由',
      minutes: '分钟'
    },
    ja: { 
      ingredients: '材料', 
      instructions: '作り方',
      title: 'レシピ詳細',
      cuisineType: '料理の種類',
      mealType: '食事の種類',
      prepTime: '準備時間',
      difficulty: '難易度',
      servings: '人数分',
      created: '作成日',
      ingredientCol: '材料',
      quantityCol: '分量',
      analyzeHealth: '健康分析',
      clear: 'クリア',
      translate: 'レシピ翻訳',
      original: '原文',
      translated: '翻訳',
      by: '作成者',
      minutes: '分'
    },
    fr: { 
      ingredients: 'Ingrédients', 
      instructions: 'Instructions',
      title: 'Détails de la Recette',
      cuisineType: 'Type de Cuisine',
      mealType: 'Type de Repas',
      prepTime: 'Temps de Préparation',
      difficulty: 'Difficulté',
      servings: 'Portions',
      created: 'Créé',
      ingredientCol: 'Ingrédient',
      quantityCol: 'Quantité',
      analyzeHealth: 'Analyser la Santé',
      clear: 'Effacer',
      translate: 'Traduire la Recette',
      original: 'Original',
      translated: 'Traduit',
      by: 'par',
      minutes: 'minutes'
    },
  };

  // Value translations for enums/labels coming from DB
  valueLabels: Record<string, {
    cuisineType: Record<string, string>;
    mealType: Record<string, string>;
    difficulty: Record<string, string>;
  }> = {
    en: {
      cuisineType: {
        American: 'American', Asian: 'Asian', Italian: 'Italian', French: 'French', Mexican: 'Mexican', Indian: 'Indian',
      },
      mealType: {
        Breakfast: 'Breakfast', Lunch: 'Lunch', Dinner: 'Dinner', Snack: 'Snack', Dessert: 'Dessert',
      },
      difficulty: { Easy: 'Easy', Medium: 'Medium', Hard: 'Hard' }
    },
    'zh-CN': {
      cuisineType: {
        American: '美式', Asian: '亚洲', Italian: '意式', French: '法式', Mexican: '墨西哥', Indian: '印度',
      },
      mealType: {
        Breakfast: '早餐', Lunch: '午餐', Dinner: '晚餐', Snack: '加餐', Dessert: '甜点',
      },
      difficulty: { Easy: '简单', Medium: '中等', Hard: '困难' }
    },
    ja: {
      cuisineType: {
        American: 'アメリカ料理', Asian: 'アジア料理', Italian: 'イタリア料理', French: 'フランス料理', Mexican: 'メキシコ料理', Indian: 'インド料理',
      },
      mealType: {
        Breakfast: '朝食', Lunch: '昼食', Dinner: '夕食', Snack: '間食', Dessert: 'デザート',
      },
      difficulty: { Easy: '簡単', Medium: '普通', Hard: '難しい' }
    },
    fr: {
      cuisineType: {
        American: 'Américain', Asian: 'Asiatique', Italian: 'Italien', French: 'Français', Mexican: 'Mexicain', Indian: 'Indien',
      },
      mealType: {
        Breakfast: 'Petit-déjeuner', Lunch: 'Déjeuner', Dinner: 'Dîner', Snack: 'En-cas', Dessert: 'Dessert',
      },
      difficulty: { Easy: 'Facile', Medium: 'Moyen', Hard: 'Difficile' }
    }
  };

  lang = 'en';
  translated: { title?: string; instructions?: string; ingredients?: Array<{name: string, quantity: string}> } | null = null;
  translating = false;
  translationError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
    private auth: AuthService,
    private aiService: AiService,
    private translationService: TranslationService,
    private tts: TtsSocketService
  ) {}

  ngOnInit() {
    this.userId = this.auth.readUserIdFromUrl() || this.auth.getUserId();
    
    const recipeId = this.route.snapshot.paramMap.get('id');
    if (recipeId) {
      this.loadRecipe(recipeId);
    } else {
      this.error = 'Recipe ID not provided';
    }
  }

  loadRecipe(recipeId: string) {
    this.loading = true;
    this.error = '';

    // Since we don't have a direct get by ID endpoint, we'll need to get all recipes and find the one we want
    if (!this.userId) {
      this.error = 'User not authenticated';
      this.loading = false;
      return;
    }

    this.recipeService.list(this.userId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok && response.recipes) {
          const recipe = response.recipes.find((r: Recipe) => r.recipeId === recipeId);
          if (recipe) {
            this.recipe = recipe;
          } else {
            this.error = 'Recipe not found';
          }
        } else {
          this.error = 'Failed to load recipe';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to load recipe';
      }
    });
  }

  goBack() {
    if (this.userId) {
      this.auth.navigateWithUserId(['/list-recipes-34475338'], this.userId);
    } else {
      this.router.navigate(['/list-recipes-34475338']);
    }
  }

  editRecipe() {
    if (this.recipe?.recipeId && this.userId) {
      this.auth.navigateWithUserId(['/recipes-34475338', this.recipe.recipeId, 'edit'], this.userId);
    }
  }

  // Open delete confirmation modal
  openDeleteModal(content: any) {
    if (!this.recipe?.recipeId || !this.userId) return;
    
    const modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title'
    });

    modalRef.result.then((result) => {
      if (result === 'yes') {
        this.confirmDelete();
      }
    }).catch((error) => {
      console.log('Modal dismissed:', error);
    });
  }

  // Actually delete the recipe
  confirmDelete() {
    if (this.recipe?.recipeId && this.userId) {
      this.recipeService.delete(this.recipe.recipeId, this.userId).subscribe({
        next: () => {
          alert('Recipe deleted successfully');
          this.goBack();
        },
        error: (err) => {
          alert('Failed to delete recipe: ' + (err.error?.error || 'Unknown error'));
        }
      });
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  isOwner(): boolean {
    return this.recipe?.ownerId === this.userId;
  }

  analyzeHealth() {
    if (!this.recipe?.recipeId || !this.userId) {
      this.healthError = 'Recipe or user information not available';
      return;
    }

    this.analyzingHealth = true;
    this.healthError = '';
    this.healthAnalysis = null;

    this.aiService.analyzeRecipeHealth(this.userId, this.recipe.recipeId).subscribe({
      next: (response) => {
        this.analyzingHealth = false;
        if (response.ok) {
          // If current language is not English, translate the AI analysis text
          if (this.lang !== 'en') {
            const analysisText = response.analysis;
            this.translationService.translateText(analysisText, this.lang).subscribe({
              next: (t) => {
                if (t.ok) {
                  this.healthAnalysis = { ...response, analysis: t.translated };
                } else {
                  this.healthAnalysis = response;
                }
              },
              error: () => {
                this.healthAnalysis = response; // fallback to English
              }
            });
          } else {
            this.healthAnalysis = response;
          }
        } else {
          this.healthError = response.error || 'Failed to analyze recipe health';
        }
      },
      error: (err) => {
        this.analyzingHealth = false;
        this.healthError = err.error?.error || 'Failed to analyze recipe health';
      }
    });
  }

  clearHealthAnalysis() {
    this.healthAnalysis = null;
    this.healthError = '';
  }

  speakInstructions() {
    this.ttsError = '';
    this.ttsAudioUrl = null;
    const text = (this.getDisplayInstructions() || []).join('. ');
    if (!text.trim()) {
      this.ttsError = 'No instructions to read';
      return;
    }
    this.ttsLoading = true;
    const sub = this.tts.onResponse().subscribe((res) => {
      if (res.ok && res.audioDataUrl) {
        this.ttsAudioUrl = res.audioDataUrl;
      } else {
        this.ttsError = res.error || 'TTS failed';
      }
      this.ttsLoading = false;
      sub.unsubscribe();
    });
    this.tts.requestTts(text);
  }

  onLangChange(code: string) {
    this.lang = code;
    if (code === 'en') { 
      this.translated = null; 
      this.translationError = '';
      return; 
    }

    this.translating = true;
    this.translationError = '';

    if (!this.recipe?.recipeId || !this.userId) {
      this.translationError = 'Recipe or user information not available';
      this.translating = false;
      return;
    }

    this.translationService.translateRecipe({
      userId: this.userId,
      recipeId: this.recipe.recipeId,
      targetLanguage: code
    }).subscribe({
      next: (response) => { 
        this.translated = response.translated; 
        this.translating = false; 
      },
      error: (err) => { 
        this.translationError = err.error?.error || 'Translation failed'; 
        this.translating = false; 
      }
    });
  }

  L(key: string): string {
    const current = (this.labels as any)[this.lang] ?? (this.labels as any)['en'];
    return current[key] || key;
  }

  // Translate enum-like values with fallback to original
  LV(category: 'cuisineType' | 'mealType' | 'difficulty', value: string | undefined): string {
    if (!value) return '';
    const current = (this.valueLabels as any)[this.lang] ?? (this.valueLabels as any)['en'];
    const map = current[category];
    // Normalize capitalization to match keys, e.g., "american" → "American"
    const normalized = value.charAt(0).toUpperCase() + value.slice(1);
    return map[normalized] || map[value] || value;
  }

  getDisplayTitle(): string {
    return this.translated?.title || this.recipe?.title || '';
  }

  getDisplayInstructions(): string[] {
    if (this.translated?.instructions) {
      return this.translated.instructions.split('\n').filter(s => s.trim());
    }
    return this.recipe?.instructions || [];
  }

  getDisplayIngredients(): Array<{name: string, quantity: string}> {
    if (this.translated?.ingredients) {
      if (Array.isArray(this.translated.ingredients)) {
        return this.translated.ingredients.map((ing, index) => {
          if (typeof ing === 'string') {
            const originalIng = this.recipe?.ingredients[index];
            return {
              name: ing,
              quantity: originalIng?.quantity || ''
            };
          } else if (ing && typeof ing === 'object' && ing.name) {
            return { 
              name: ing.name, 
              quantity: ing.quantity || this.recipe?.ingredients[index]?.quantity || '' 
            };
          }
          return this.recipe?.ingredients[index] || { name: '', quantity: '' };
        });
      }
    }
    return this.recipe?.ingredients || [];
  }
}

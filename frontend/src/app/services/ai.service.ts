import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HealthAnalysis {
  ok: boolean;
  analysis: string;
  recipe: {
    title: string;
    ingredients: Array<{name: string, quantity: string}>;
    servings: number;
    mealType: string;
  };
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = '';

  constructor(private http: HttpClient) { }

  analyzeRecipeHealth(userId: string, recipeId: string): Observable<HealthAnalysis> {
    return this.http.post<HealthAnalysis>(`${this.apiUrl}/analyze-recipe-health-34475338`, {
      userId,
      recipeId
    });
  }
}

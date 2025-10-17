import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TranslationRequest {
  userId: string;
  recipeId: string;
  targetLanguage: string;
}

export interface TranslationResponse {
  ok: boolean;
  translated: {
    title?: string;
    instructions?: string;
    ingredients?: Array<{name: string, quantity: string}>;
  };
  originalLanguage: string;
  targetLanguage: string;
  recipe: {
    title: string;
    ingredients: Array<{name: string, quantity: string}>;
    instructions: string[];
  };
  error?: string;
}

export interface TextTranslationResponse {
  ok: boolean;
  translated: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private apiUrl = '';

  constructor(private http: HttpClient) { }

  translateRecipe(request: TranslationRequest): Observable<TranslationResponse> {
    return this.http.post<TranslationResponse>(`${this.apiUrl}/translate-recipe-34475338`, request);
  }

  translateText(text: string, targetLanguage: string): Observable<TextTranslationResponse> {
    return this.http.post<TextTranslationResponse>(`${this.apiUrl}/translate-text-34475338`, { text, targetLanguage });
  }
}

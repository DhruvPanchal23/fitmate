import { Injectable, Logger } from '@nestjs/common';
import { AiCoachResponse } from '../../../../shared/contracts/ai';

@Injectable()
export class ResponseGuardService {
  private readonly logger = new Logger(ResponseGuardService.name);

  private readonly profanityWords = [
    'fuck', 'shit', 'asshole', 'bitch', 'crap', 'cunt', 'bastard', 'dick', 'pussy'
  ];

  /**
   * Validates and filters/moderates LLM response.
   * Auto-repairs malformed JSON.
   */
  validateAndClean(rawText: string): AiCoachResponse {
    let cleanedText = rawText.trim();
    
    // 1. Moderate Profanity
    cleanedText = this.sanitizeProfanity(cleanedText);

    // 2. Extract and Auto-Repair JSON
    let parsed: any = null;
    try {
      parsed = this.extractAndParseJson(cleanedText);
    } catch (e) {
      this.logger.warn(`Failed to parse response JSON: ${e.message}. Attempting auto-repair...`);
      try {
        parsed = this.repairAndParseJson(cleanedText);
      } catch (repairError) {
        this.logger.error(`JSON auto-repair failed: ${repairError.message}`);
        // Return structured default fallback containing the raw text
        return {
          answer: this.stripMarkdown(cleanedText),
          suggestedFoods: [],
          suggestedMeals: [],
          warnings: ['AI output JSON format could not be verified.'],
          followUpQuestions: ['Could you please rephrase or try again?'],
        };
      }
    }

    // 3. Normalize JSON schema structure
    const validated: AiCoachResponse = {
      answer: String(parsed.answer || '').trim(),
      suggestedFoods: Array.isArray(parsed.suggestedFoods) ? parsed.suggestedFoods.map(String) : [],
      suggestedMeals: Array.isArray(parsed.suggestedMeals) ? parsed.suggestedMeals.map(String) : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String) : [],
      followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions.map(String) : [],
    };

    if (parsed.estimatedMacros && typeof parsed.estimatedMacros === 'object') {
      validated.estimatedMacros = {
        calories: Math.max(0, Number(parsed.estimatedMacros.calories) || 0),
        protein: Math.max(0, Number(parsed.estimatedMacros.protein) || 0),
        carbs: Math.max(0, Number(parsed.estimatedMacros.carbs) || 0),
        fat: Math.max(0, Number(parsed.estimatedMacros.fat) || 0),
      };
    }

    // 4. Validate Safety Bounds
    this.applyNutritionSafetyRules(validated);

    return validated;
  }

  private sanitizeProfanity(text: string): string {
    let sanitized = text;
    for (const word of this.profanityWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      sanitized = sanitized.replace(regex, '***');
    }
    return sanitized;
  }

  private extractAndParseJson(text: string): any {
    let target = text;
    if (target.includes('```json')) {
      target = target.split('```json')[1].split('```')[0].trim();
    } else if (target.includes('```')) {
      target = target.split('```')[1].split('```')[0].trim();
    }
    return JSON.parse(target);
  }

  private repairAndParseJson(text: string): any {
    // Attempt standard auto-repairs
    let target = text;
    if (target.includes('```json')) {
      target = target.split('```json')[1].split('```')[0].trim();
    } else if (target.includes('```')) {
      target = target.split('```')[1].split('```')[0].trim();
    }

    // Repair unclosed brackets/braces
    let openBraces = 0;
    let openBrackets = 0;
    for (let i = 0; i < target.length; i++) {
      if (target[i] === '{') openBraces++;
      else if (target[i] === '}') openBraces--;
      else if (target[i] === '[') openBrackets++;
      else if (target[i] === ']') openBrackets--;
    }

    while (openBrackets > 0) {
      target += ']';
      openBrackets--;
    }
    while (openBraces > 0) {
      target += '}';
      openBraces--;
    }

    // Remove trailing commas before closing braces/brackets
    target = target.replace(/,\s*([}\]])/g, '$1');

    return JSON.parse(target);
  }

  private applyNutritionSafetyRules(response: AiCoachResponse): void {
    if (!response.warnings) {
      response.warnings = [];
    }

    // Calorie intake validation
    if (response.estimatedMacros) {
      const { calories, protein, carbs, fat } = response.estimatedMacros;

      // 1. Check for dangerously low calories recommendation (crash diets)
      if (calories > 0 && calories < 1000) {
        response.estimatedMacros.calories = 1200; // Auto-adjust to absolute baseline safety minimum
        response.warnings.push('AI recommended calorie targets were adjusted to safe physiological minimums (>= 1200 kcal/day).');
      }

      // 2. Check for dangerously high calories recommendation
      if (calories > 8000) {
        response.estimatedMacros.calories = 3500; // Auto-adjust to reasonable high target
        response.warnings.push('AI recommended calorie targets were adjusted to fit standard limits.');
      }

      // 3. Verify macronutrient-calorie alignment (professorial macro hallucination audit)
      // Carbs: 4kcal/g, Protein: 4kcal/g, Fat: 9kcal/g
      const calculatedCal = (carbs * 4) + (protein * 4) + (fat * 9);
      if (calories > 0 && Math.abs(calculatedCal - calories) > 500) {
        // Hallucinated macros don't match the calories target
        this.logger.warn(`Estimated macros did not match calorie budget (Macros: ${calculatedCal} vs Calories: ${calories}). Re-aligning...`);
        // Recalculate target calories based on macros if macros look solid, or vice-versa
        response.estimatedMacros.calories = Math.round(calculatedCal);
        response.warnings.push('Estimated calorie totals were re-balanced to align with macro ratios.');
      }
    }

    // Dangerous advice keywords filter
    const lowercaseAnswer = response.answer.toLowerCase();
    if (
      lowercaseAnswer.includes('starve') || 
      lowercaseAnswer.includes('water fast') || 
      lowercaseAnswer.includes('don\'t eat') || 
      lowercaseAnswer.includes('skip eating for days')
    ) {
      response.warnings.push('Caution: FitMate advocates for steady, sustainable progress. Avoid extreme caloric restriction.');
    }
  }

  private stripMarkdown(text: string): string {
    return text.replace(/[`#*_-]/g, '').trim();
  }
}
export default ResponseGuardService;

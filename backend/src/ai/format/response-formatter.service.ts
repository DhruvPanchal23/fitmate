import { Injectable } from '@nestjs/common';
import { AiCoachResponse } from '../../../../shared/contracts';

@Injectable()
export class ResponseFormatter {
  formatResponse(rawText: string): AiCoachResponse {
    try {
      // Find JSON block if it is wrapped in markdown code blocks
      let cleaned = rawText.trim();
      if (cleaned.includes('```json')) {
        cleaned = cleaned.split('```json')[1].split('```')[0].trim();
      } else if (cleaned.includes('```')) {
        cleaned = cleaned.split('```')[1].split('```')[0].trim();
      }

      const parsed = JSON.parse(cleaned);

      return {
        answer: parsed.answer || 'I am ready to help you with your diet logs.',
        suggestedFoods: Array.isArray(parsed.suggestedFoods) ? parsed.suggestedFoods : [],
        suggestedMeals: Array.isArray(parsed.suggestedMeals) ? parsed.suggestedMeals : [],
        estimatedMacros: parsed.estimatedMacros && typeof parsed.estimatedMacros === 'object'
          ? {
              calories: Number(parsed.estimatedMacros.calories) || 0,
              protein: Number(parsed.estimatedMacros.protein) || 0,
              carbs: Number(parsed.estimatedMacros.carbs) || 0,
              fat: Number(parsed.estimatedMacros.fat) || 0,
            }
          : undefined,
        warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
        followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : [],
      };
    } catch (e) {
      // Fallback response structure
      return {
        answer: rawText || 'Could not process response. Please try asking again.',
        suggestedFoods: [],
        suggestedMeals: [],
        warnings: ['An error occurred while parsing the AI response.'],
        followUpQuestions: ['Can you try rephrasing your question?'],
      };
    }
  }
}
export default ResponseFormatter;

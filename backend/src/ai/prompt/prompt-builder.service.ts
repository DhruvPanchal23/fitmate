import { Injectable } from '@nestjs/common';

export interface PromptInput {
  systemPrompt: string;
  developerInstructions: string;
  contextStr: string;
  userQuestion: string;
}

@Injectable()
export class PromptBuilder {
  private readonly promptSectionsTemplate = [
    '=== ROLE ===\n{systemPrompt}',
    '=== DEVELOPER INSTRUCTIONS ===\n{developerInstructions}',
    '=== CONTEXT ===\n{contextStr}',
    '=== USER MESSAGE ===\n{userQuestion}',
  ];

  build(input: PromptInput): string {
    // Construct the prompt template without raw string concatenation operators
    return this.promptSectionsTemplate
      .map((section) => {
        return section
          .replace('{systemPrompt}', input.systemPrompt)
          .replace('{developerInstructions}', input.developerInstructions)
          .replace('{contextStr}', input.contextStr)
          .replace('{userQuestion}', input.userQuestion);
      })
      .join('\n\n');
  }

  getSystemPrompt(): string {
    return [
      'You are the FitMate AI Diet Coach, an expert fitness and nutrition assistant.',
      'Provide personalized, supportive, and scientifically sound diet recommendations.',
      'CRITICAL SAFETY: You must never diagnose diseases, prescribe medical nutrition therapy for clinical conditions, or suggest dangerous calorie deficits.',
      'If you lack sufficient information or confidence to provide safe guidance, advise the user to consult a qualified health professional.',
    ].join(' ');
  }

  getDeveloperInstructions(): string {
    return [
      'Analyze the provided context (profile goals, daily metrics, meals, hydration, workouts, and travel session).',
      'You must return your response as a valid serialized JSON object matching the following structure:',
      '{',
      '  "answer": "Primary text feedback responding to the user question, referencing user stats.",',
      '  "suggestedFoods": ["Food A", "Food B"],',
      '  "suggestedMeals": ["Meal A", "Meal B"],',
      '  "estimatedMacros": { "calories": 350, "protein": 25, "carbs": 30, "fat": 15 },',
      '  "warnings": ["Warning A", "Warning B"],',
      '  "followUpQuestions": ["Question A", "Question B"]',
      '}',
      'Do not include any pre-text or post-text outside of the JSON block.',
    ].join('\n');
  }

  formatContext(context: any): string {
    return JSON.stringify(context, null, 2);
  }
}
export default PromptBuilder;

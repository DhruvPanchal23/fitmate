import { Injectable } from '@nestjs/common';
import { AIProvider, AIProviderResponse } from './ai-provider.interface';
import { Observable } from 'rxjs';

@Injectable()
export class MockProvider implements AIProvider {
  private getMockReply(prompt: string): string {
    const lowercasePrompt = prompt.toLowerCase();
    
    // Default mock responses containing relevant fitmate advice
    if (lowercasePrompt.includes('leg day')) {
      return JSON.stringify({
        answer: "Since you completed a leg day workout, you need fast-digesting protein and carbohydrates for muscle repair and glycogen replenishment.",
        suggestedFoods: ["Whey Protein", "Banana", "Chicken Breast", "Greek Yogurt"],
        suggestedMeals: ["Post-workout Protein Shake with Oats", "Chicken Breast with Sweet Potato"],
        estimatedMacros: { calories: 480, protein: 38, carbs: 55, fat: 10 },
        warnings: ["Ensure you hydrate with at least 500ml of water.", "Avoid high-fat meals post-workout."],
        followUpQuestions: ["Did you log your workout details yet?", "Would you like a vegetarian post-workout option?"]
      });
    } else if (lowercasePrompt.includes('protein')) {
      return JSON.stringify({
        answer: "To reach your protein target, incorporate lean protein sources into every meal and snack. Focus on high-protein foods to avoid overshooting calories.",
        suggestedFoods: ["Chicken Breast", "Tofu", "Egg Whites", "Lentils"],
        suggestedMeals: ["Scrambled Egg Whites with Spinach", "Sautéed Tofu with Broccoli"],
        estimatedMacros: { calories: 300, protein: 42, carbs: 8, fat: 6 },
        warnings: ["Make sure you balance high-protein items with adequate fiber intake."],
        followUpQuestions: ["Would you prefer dairy-free protein sources?", "Can I suggest a high-protein dinner option?"]
      });
    } else {
      return JSON.stringify({
        answer: "I've reviewed your current metrics. Focus on maintaining a slight calorie deficit and consuming balanced plates with 1/2 vegetables, 1/4 protein, and 1/4 complex carbs.",
        suggestedFoods: ["Eggs", "Salad greens", "Berries", "Paneer"],
        suggestedMeals: ["Grilled chicken with broccoli and brown rice"],
        estimatedMacros: { calories: 350, protein: 25, carbs: 30, fat: 15 },
        warnings: [],
        followUpQuestions: ["Would you like me to analyze your latest meal log?", "How can I help you optimize your macronutrient ratio today?"]
      });
    }
  }

  async generateResponse(
    prompt: string,
    systemPrompt?: string,
    options?: { temperature?: number; maxTokens?: number; model?: string }
  ): Promise<AIProviderResponse> {
    // Simulated short delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    const reply = this.getMockReply(prompt);
    
    return {
      text: reply,
      usage: {
        promptTokens: Math.round(prompt.length / 4),
        completionTokens: Math.round(reply.length / 4),
      },
    };
  }

  generateStream(
    prompt: string,
    systemPrompt?: string,
    options?: { temperature?: number; maxTokens?: number; model?: string }
  ): Observable<string> {
    const reply = this.getMockReply(prompt);
    
    // Split text into small chunks and stream them
    return new Observable<string>((subscriber) => {
      const words = reply.split(' ');
      let index = 0;
      
      const interval = setInterval(() => {
        if (index < words.length) {
          subscriber.next(words[index] + (index === words.length - 1 ? '' : ' '));
          index++;
        } else {
          clearInterval(interval);
          subscriber.complete();
        }
      }, 30); // emit word every 30ms

      return () => clearInterval(interval);
    });
  }
}
export default MockProvider;

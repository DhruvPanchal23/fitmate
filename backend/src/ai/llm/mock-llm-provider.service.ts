import { Injectable } from '@nestjs/common';
import { LLMProvider } from './llm-provider.interface';

@Injectable()
export class MockLLMProvider implements LLMProvider {
  async generateResponse(prompt: string): Promise<string> {
    // Simulated delay to feel realistic
    await new Promise((resolve) => setTimeout(resolve, 600));

    const lowercasePrompt = prompt.toLowerCase();
    
    // Extract targets and currents dynamically from the prompt block
    const getVal = (regex: RegExp, defaultVal: number): number => {
      const match = prompt.match(regex);
      return match ? parseInt(match[1], 10) : defaultVal;
    };

    const getStr = (regex: RegExp, defaultVal: string): string => {
      const match = prompt.match(regex);
      return match ? match[1].trim() : defaultVal;
    };

    const calTarget = getVal(/Calorie Target:\s*(\d+)/i, 2200);
    const calCurrent = getVal(/Current Calories:\s*(\d+)/i, 0);
    const protTarget = getVal(/Protein Target:\s*(\d+)/i, 150);
    const protCurrent = getVal(/Current Protein:\s*(\d+)/i, 0);
    const goal = getStr(/Goal:\s*([^\n]+)/i, 'maintenance');

    const calDeficit = Math.max(0, calTarget - calCurrent);

    let answer = '';
    let suggestedFoods: string[] = [];
    let suggestedMeals: string[] = [];
    let estimatedMacros = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    let warnings: string[] = [];
    let followUpQuestions: string[] = [];

    if (lowercasePrompt.includes('leg day')) {
      answer = `Since you completed a leg day workout, you need fast-digesting protein and carbohydrates for muscle repair and glycogen replenishment. Your target protein is ${protTarget}g, and you have consumed ${protCurrent}g today.`;
      suggestedFoods = ['Whey Protein', 'Banana', 'Chicken Breast', 'Sweet Potato', 'Greek Yogurt'];
      suggestedMeals = ['Post-workout Protein Shake with Oats', 'Chicken Breast with Sweet Potato and Sautéed Asparagus', 'High-Protein Paneer Rice Bowl'];
      estimatedMacros = { calories: 480, protein: 38, carbs: 55, fat: 10 };
      warnings = ['Ensure you hydrate with at least 500ml of water within the next hour.', 'Avoid high-fat meals immediately post-workout as they slow down digestion.'];
      followUpQuestions = ['Did you log your workout details yet?', 'Would you like a vegetarian post-workout option?'];
    } else if (lowercasePrompt.includes('increase my protein')) {
      answer = `To reach your protein goal of ${protTarget}g (current: ${protCurrent}g), you should incorporate lean protein sources into every meal and snack. Focus on high-protein foods to avoid overshooting calories.`;
      suggestedFoods = ['Chicken Breast', 'Tofu', 'Egg Whites', 'Paneer', 'Lentils', 'Fish'];
      suggestedMeals = ['Scrambled Egg Whites with Spinach', 'Sautéed Tofu/Paneer with Broccoli', 'Double Scoop Whey Protein Shake'];
      estimatedMacros = { calories: 300, protein: 42, carbs: 8, fat: 6 };
      warnings = ['Make sure you balance high-protein items with adequate fiber intake.', 'Too much protein at once can be hard to digest, spread it across 3-4 servings.'];
      followUpQuestions = ['Would you prefer dairy-free protein sources?', 'Can I suggest a high-protein dinner option?'];
    } else if (lowercasePrompt.includes('vegetarian breakfast')) {
      answer = `Here is a high-protein vegetarian breakfast suggestion designed to support your ${goal.toLowerCase()} goal. Soya chunks, paneer, and eggs (if included) are great options.`;
      suggestedFoods = ['Paneer', 'Sprouted Moong', 'Besan (Gram Flour)', 'Greek Yogurt', 'Chia Seeds'];
      suggestedMeals = ['Paneer Bhurji with Whole Wheat Toast', 'Besan Chilla with Paneer stuffing', 'Sprouted Moong Salad'];
      estimatedMacros = { calories: 410, protein: 24, carbs: 32, fat: 16 };
      warnings = ['Vegetarian proteins are often incomplete; pair grains with legumes for a full amino acid profile.'];
      followUpQuestions = ['Do you eat eggs?', 'Would you like a vegan/dairy-free option?'];
    } else if (lowercasePrompt.includes('under my calorie target') || lowercasePrompt.includes('calorie target')) {
      answer = `Your calorie target is ${calTarget} kcal. Today you have consumed ${calCurrent} kcal. You have ${calDeficit} kcal remaining to reach your budget.`;
      suggestedFoods = ['Almonds', 'Cucumber slices', 'Apple with Peanut Butter'];
      suggestedMeals = ['Light Salad with Vinaigrette', 'Grilled Chicken/Paneer Salad'];
      estimatedMacros = { calories: 150, protein: 10, carbs: 15, fat: 6 };
      warnings = ['Do not skip meals just to stay under target; consistent fueling prevents evening binging.'];
      followUpQuestions = ['Would you like suggestions for a low-calorie dinner?', 'Do you want to log a snack?'];
    } else if (lowercasePrompt.includes('skip creatine')) {
      answer = 'For creatine to be effective, daily consistency is key to maintaining muscle saturation. Skipping a single day won\'t lose all progress, but try to stay consistent. Your dosage is 3-5g.';
      suggestedFoods = ['Water (creatine absorption requires proper hydration)'];
      suggestedMeals = [];
      estimatedMacros = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      warnings = ['Always drink at least 500ml of water when consuming creatine.'];
      followUpQuestions = ['Have you already logged your supplements today?', 'Are you experiencing any bloating?'];
    } else if (lowercasePrompt.includes('dinner under 500 calories') || lowercasePrompt.includes('dinner')) {
      answer = `Here are some low-calorie, high-satiety dinner ideas under 500 calories tailored to your ${goal.toLowerCase()} goal.`;
      suggestedFoods = ['Broccoli', 'Cauliflower Rice', 'Grilled Fish', 'Tofu', 'Lean Paneer'];
      suggestedMeals = ['Grilled Fish/Chicken with Sautéed Veggies', 'Tofu Stuffed Bell Peppers', 'Cauliflower Fried Rice with Paneer cubes'];
      estimatedMacros = { calories: 380, protein: 32, carbs: 25, fat: 12 };
      warnings = ['Keep cooking oil minimal (1 tsp max) to avoid hidden calories.'];
      followUpQuestions = ['Would you prefer a completely plant-based dinner?', 'Do you want me to list dessert alternatives under 100 calories?'];
    } else {
      answer = `I've reviewed your current daily metrics. Here are customized recommendations to help you hit your goal of ${goal.toLowerCase()}. Let me know what specific questions you have about your meal logs, water logs, or workouts!`;
      suggestedFoods = ['Eggs', 'Salad greens', 'Berries', 'Paneer'];
      suggestedMeals = ['Balanced plate with 1/2 vegetables, 1/4 protein, 1/4 complex carbs'];
      estimatedMacros = { calories: 350, protein: 25, carbs: 30, fat: 15 };
      warnings = [];
      followUpQuestions = ['Would you like me to analyze your latest meal log?', 'How can I help you optimize your macronutrient ratio today?'];
    }

    const payload = {
      answer,
      suggestedFoods,
      suggestedMeals,
      estimatedMacros,
      warnings,
      followUpQuestions,
    };

    return JSON.stringify(payload);
  }
}
export default MockLLMProvider;

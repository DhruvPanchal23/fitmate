import { Injectable } from '@nestjs/common';
import {
  BMRCalculator,
  TDEECalculator,
  MacroCalculator,
  WaterCalculator,
  CreatineCalculator,
  FiberCalculator,
  SugarCalculator,
  BMIHelper,
} from './goal-engine/goal-engine';
import { SmartGoalsResponse } from '../../../shared/contracts/goals';

@Injectable()
export class GoalEngineFacade {
  private readonly bmrCalculator = new BMRCalculator();
  private readonly tdeeCalculator = new TDEECalculator();
  private readonly macroCalculator = new MacroCalculator();
  private readonly waterCalculator = new WaterCalculator();
  private readonly creatineCalculator = new CreatineCalculator();
  private readonly fiberCalculator = new FiberCalculator();
  private readonly sugarCalculator = new SugarCalculator();
  private readonly bmiHelper = new BMIHelper();

  calculateGoals(profile: {
    gender: string;
    age: number;
    weight: number;
    height: number;
    activityLevel: string;
    goal: string;
    dietPreference: string;
    gymExperience: string;
    bodyFatPercentage?: number | null;
    formula?: string;
  }): SmartGoalsResponse {
    const formula = profile.formula || 'mifflin';

    const bmr = this.bmrCalculator.calculate({
      gender: profile.gender,
      age: profile.age,
      weight: profile.weight,
      height: profile.height,
      bodyFatPercentage: profile.bodyFatPercentage,
      formula,
    });

    const tdee = this.tdeeCalculator.calculate(bmr, profile.activityLevel);

    const macros = this.macroCalculator.calculate({
      tdee,
      goal: profile.goal,
      weight: profile.weight,
      dietPreference: profile.dietPreference,
    });

    const water = this.waterCalculator.calculate(profile.weight, profile.activityLevel);
    const creatine = this.creatineCalculator.calculate(profile.weight, profile.goal, profile.gymExperience);
    const fiber = this.fiberCalculator.calculate(macros.calories, profile.gender);
    const sugar = this.sugarCalculator.calculate(macros.calories);
    const bmi = this.bmiHelper.calculate(profile.weight, profile.height);

    const activityMultiplier = Math.round((tdee / bmr) * 1000) / 1000;

    return {
      bmr,
      tdee,
      maintenanceCalories: tdee,
      targetCalories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fats: macros.fats,
      water,
      creatine,
      fiber,
      sugar,
      bmi,
      activityMultiplier,
      formula,
    };
  }
}
export default GoalEngineFacade;

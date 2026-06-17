import {
  BMRCalculator,
  TDEECalculator,
  MacroCalculator,
  WaterCalculator,
  CreatineCalculator,
  FiberCalculator,
  SugarCalculator,
  BMIHelper,
} from './goal-engine';

describe('GoalEngine Calculations', () => {
  const bmrCalc = new BMRCalculator();
  const tdeeCalc = new TDEECalculator();
  const macroCalc = new MacroCalculator();
  const waterCalc = new WaterCalculator();
  const creatineCalc = new CreatineCalculator();
  const fiberCalc = new FiberCalculator();
  const sugarCalc = new SugarCalculator();
  const bmiHelper = new BMIHelper();

  describe('BMRCalculator', () => {
    it('should calculate BMR correctly using Mifflin-St Jeor strategy for male', () => {
      const bmr = bmrCalc.calculate({
        gender: 'male',
        age: 25,
        weight: 70,
        height: 175,
        formula: 'mifflin',
      });
      expect(bmr).toBe(1674); // 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 rounded to 1674
    });

    it('should calculate BMR correctly using Harris-Benedict strategy for female', () => {
      const bmr = bmrCalc.calculate({
        gender: 'female',
        age: 30,
        weight: 60,
        height: 160,
        formula: 'harris-benedict',
      });
      expect(bmr).toBe(1368); // 447.593 + 9.247*60 + 3.098*160 - 4.330*30 = 447.593 + 554.82 + 495.68 - 129.9 = 1368.193 rounded to 1368
    });

    it('should fall back to Mifflin-St Jeor in Katch-McArdle if bodyFatPercentage is missing', () => {
      const bmr = bmrCalc.calculate({
        gender: 'male',
        age: 25,
        weight: 70,
        height: 175,
        formula: 'katch-mcardle',
      });
      expect(bmr).toBe(1674);
    });

    it('should calculate correctly using Katch-McArdle if bodyFatPercentage is provided', () => {
      const bmr = bmrCalc.calculate({
        gender: 'male',
        age: 25,
        weight: 70,
        height: 175,
        bodyFatPercentage: 15,
        formula: 'katch-mcardle',
      });
      // LBM = 70 * (1 - 0.15) = 59.5
      // BMR = 370 + 21.6 * 59.5 = 370 + 1285.2 = 1655.2 rounded to 1655
      expect(bmr).toBe(1655);
    });
  });

  describe('TDEECalculator', () => {
    it('should apply activity multiplier correctly', () => {
      const tdee = tdeeCalc.calculate(1500, 'sedentary');
      expect(tdee).toBe(1800); // 1500 * 1.2 = 1800
    });
  });

  describe('MacroCalculator', () => {
    it('should calculate macros for fat_loss goal', () => {
      const macros = macroCalc.calculate({
        tdee: 2200,
        goal: 'fat_loss',
        weight: 80,
        dietPreference: 'none',
      });
      expect(macros.calories).toBe(1700);
      expect(macros.protein).toBe(144); // 80 * 1.8 = 144
      expect(macros.fats).toBe(47); // 1700 * 0.25 / 9 = 47.2 rounded
      expect(macros.carbs).toBe(175); // (1700 - 144*4 - 47*9) / 4 = (1700 - 576 - 423) / 4 = 701 / 4 = 175
    });

    it('should calculate macros for muscle_gain goal', () => {
      const macros = macroCalc.calculate({
        tdee: 2200,
        goal: 'muscle_gain',
        weight: 80,
        dietPreference: 'none',
      });
      expect(macros.calories).toBe(2500); // 2200 + 300
      expect(macros.protein).toBe(176); // 80 * 2.2 = 176
      expect(macros.fats).toBe(69); // 2500 * 0.25 / 9 = 69.4
    });
  });

  describe('WaterCalculator', () => {
    it('should adjust water target for active level', () => {
      const water = waterCalc.calculate(80, 'active');
      expect(water).toBe(3.4); // 80 * 0.033 + 0.75 = 2.64 + 0.75 = 3.39 rounded to 3.4
    });
  });

  describe('CreatineCalculator', () => {
    it('should output creatine recommendations', () => {
      expect(creatineCalc.calculate(80, 'muscle_gain', 'beginner')).toBe(5.0);
      expect(creatineCalc.calculate(80, 'fat_loss', 'beginner')).toBe(3.0);
    });
  });

  describe('FiberCalculator', () => {
    it('should calculate fiber correctly based on calorie target', () => {
      expect(fiberCalc.calculate(2000, 'male')).toBe(30); // 2 * 14 = 28, max(30, 28) = 30
    });
  });

  describe('SugarCalculator', () => {
    it('should return sugar gram limit', () => {
      expect(sugarCalc.calculate(2000)).toBe(50); // 2000 * 0.1 / 4 = 50
    });
  });

  describe('BMIHelper', () => {
    it('should calculate BMI correctly', () => {
      expect(bmiHelper.calculate(70, 175)).toBe(22.9); // 70 / 1.75^2 = 22.85 rounded to 22.9
    });
  });
});

export interface BmrCalculationParams {
  gender: string;
  age: number;
  weight: number;      // in kg
  height: number;      // in cm
  bodyFatPercentage?: number | null;
}

export interface BmrStrategy {
  name: string;
  calculate(params: BmrCalculationParams): number;
}

export class MifflinStJeorStrategy implements BmrStrategy {
  readonly name = 'Mifflin-St Jeor';

  calculate(params: BmrCalculationParams): number {
    const { gender, age, weight, height } = params;
    if (gender.toLowerCase() === 'male' || gender.toLowerCase() === 'm') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }
}

export class HarrisBenedictStrategy implements BmrStrategy {
  readonly name = 'Harris-Benedict';

  calculate(params: BmrCalculationParams): number {
    const { gender, age, weight, height } = params;
    if (gender.toLowerCase() === 'male' || gender.toLowerCase() === 'm') {
      return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      return 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
    }
  }
}

export class KatchMcArdleStrategy implements BmrStrategy {
  readonly name = 'Katch-McArdle';

  calculate(params: BmrCalculationParams): number {
    const { weight, bodyFatPercentage } = params;
    if (bodyFatPercentage !== undefined && bodyFatPercentage !== null) {
      const lbm = weight * (1 - bodyFatPercentage / 100);
      return 370 + 21.6 * lbm;
    }
    // Fallback if body fat is missing
    return new MifflinStJeorStrategy().calculate(params);
  }
}

export function getBmrStrategy(formula: string): BmrStrategy {
  switch (formula.toLowerCase()) {
    case 'harris-benedict':
    case 'harris_benedict':
      return new HarrisBenedictStrategy();
    case 'katch-mcardle':
    case 'katch_mcardle':
      return new KatchMcArdleStrategy();
    case 'mifflin-stjeor':
    case 'mifflin_st_jeor':
    case 'mifflin':
    default:
      return new MifflinStJeorStrategy();
  }
}

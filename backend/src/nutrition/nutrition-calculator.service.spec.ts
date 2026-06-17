import { Test, TestingModule } from '@nestjs/testing';
import { NutritionCalculatorService } from './nutrition-calculator.service';
import { MealsRepository } from '../meals/meals.repository';
import { WaterRepository } from '../water/water.repository';
import { SupplementsRepository } from '../supplements/supplements.repository';
import { ExerciseRepository } from '../exercise/exercise.repository';

describe('NutritionCalculatorService', () => {
  let service: NutritionCalculatorService;
  let mealsRepository: jest.Mocked<MealsRepository>;
  let waterRepository: jest.Mocked<WaterRepository>;
  let supplementsRepository: jest.Mocked<SupplementsRepository>;
  let exerciseRepository: jest.Mocked<ExerciseRepository>;

  beforeEach(async () => {
    const mockMealsRepository = {
      findMany: jest.fn(),
    };
    const mockWaterRepository = {
      findMany: jest.fn(),
    };
    const mockSupplementsRepository = {
      findMany: jest.fn(),
    };
    const mockExerciseRepository = {
      findMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NutritionCalculatorService,
        { provide: MealsRepository, useValue: mockMealsRepository },
        { provide: WaterRepository, useValue: mockWaterRepository },
        { provide: SupplementsRepository, useValue: mockSupplementsRepository },
        { provide: ExerciseRepository, useValue: mockExerciseRepository },
      ],
    }).compile();

    service = module.get<NutritionCalculatorService>(NutritionCalculatorService);
    mealsRepository = module.get(MealsRepository);
    waterRepository = module.get(WaterRepository);
    supplementsRepository = module.get(SupplementsRepository);
    exerciseRepository = module.get(ExerciseRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate daily summary accurately', async () => {
    mealsRepository.findMany.mockResolvedValue([
      {
        id: 'meal-1',
        mealType: 'Breakfast',
        items: [
          { calories: 300, protein: 20, carbohydrates: 40, fats: 5, fiber: 3, sugar: 4 },
          { calories: 150, protein: 10, carbohydrates: 20, fats: 2, fiber: 1, sugar: 2 },
        ],
      } as any,
    ]);

    waterRepository.findMany.mockResolvedValue([
      { amount: 500 } as any,
      { amount: 250 } as any,
    ]);

    supplementsRepository.findMany.mockResolvedValue([
      { name: 'Creatine' } as any,
      { name: 'Omega 3' } as any,
    ]);

    exerciseRepository.findMany.mockResolvedValue([
      { caloriesBurned: 400 } as any,
    ]);

    const summary = await service.calculateDailySummary('user-1', '2026-06-17');

    expect(summary.calories).toBe(4500); // 450 * 10
    expect(summary.protein).toBe(300); // 30 * 10
    expect(summary.water).toBe(750);
    expect(summary.supplements).toContain('Creatine');
    expect(summary.supplements).toContain('Omega 3');
    expect(summary.exerciseCalories).toBe(400);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { FoodMatchingEngine } from './food-matching-engine.service';
import { FoodsRepository } from '../../nutrition/foods.repository';

describe('FoodMatchingEngine', () => {
  let engine: FoodMatchingEngine;
  let foodsRepository: jest.Mocked<FoodsRepository>;

  beforeEach(async () => {
    const mockFoodsRepository = {
      search: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodMatchingEngine,
        { provide: FoodsRepository, useValue: mockFoodsRepository },
      ],
    }).compile();

    engine = module.get<FoodMatchingEngine>(FoodMatchingEngine);
    foodsRepository = module.get(FoodsRepository);
  });

  it('should be defined', () => {
    expect(engine).toBeDefined();
  });

  it('should return exact match with high confidence score', async () => {
    const mockFood = {
      id: 'f-1',
      name: 'Oatmeal',
      calories: 150,
      protein: 5,
      carbohydrates: 27,
      fats: 2.5,
      fiber: 4,
      sugar: 1,
      defaultUnit: 'g',
      servingSize: 100,
      source: 'catalog',
    };

    foodsRepository.search.mockResolvedValue([mockFood as any]);

    const result = await engine.matchFood('Oatmeal');

    expect(result.bestMatch).toEqual(mockFood);
    expect(result.confidenceScore).toBe(0.98);
  });

  it('should return partial match with moderate confidence score', async () => {
    const mockFood = {
      id: 'f-1',
      name: 'Oatmeal with Honey',
      calories: 180,
      protein: 5,
      carbohydrates: 35,
      fats: 2.5,
      fiber: 4,
      sugar: 8,
      defaultUnit: 'g',
      servingSize: 100,
      source: 'catalog',
    };

    foodsRepository.search.mockResolvedValue([mockFood as any]);

    const result = await engine.matchFood('Oatmeal');

    expect(result.bestMatch).toEqual(mockFood);
    expect(result.confidenceScore).toBe(0.85);
  });

  it('should fallback to defaults when no search results are found', async () => {
    foodsRepository.search.mockResolvedValueOnce([]); // search for input
    foodsRepository.search.mockResolvedValueOnce([
      { id: 'f-default', name: 'Oatmeal' } as any,
    ]); // search for Oatmeal fallback

    const result = await engine.matchFood('NonExistentFood');

    expect(result.bestMatch).toBeNull();
    expect(result.confidenceScore).toBe(0.0);
    expect(result.alternativeMatches).toHaveLength(1);
    expect(result.alternativeMatches[0].id).toBe('f-default');
  });
});

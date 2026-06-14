import { Injectable } from '@nestjs/common';
import { VisionProvider } from './vision-provider.interface';
import { VisionRawResponse } from '../../../../shared/contracts';

@Injectable()
export class MockVisionProvider implements VisionProvider {
  async analyzeImage(imageUrl: string): Promise<VisionRawResponse> {
    // Simulate image analysis latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      model: 'fitmate-vision-mock-v1',
      detectedItems: [
        {
          foodName: 'Chicken Breast',
          estimatedQuantity: 150,
          unit: 'g',
          calories: 250,
          protein: 46,
          carbohydrates: 0,
          fats: 5,
          fiber: 0,
          sugar: 0,
          confidence: 0.96,
        },
        {
          foodName: 'White Rice',
          estimatedQuantity: 200,
          unit: 'g',
          calories: 260,
          protein: 5.4,
          carbohydrates: 56,
          fats: 0.6,
          fiber: 0.8,
          sugar: 0.2,
          confidence: 0.98,
        },
        {
          foodName: 'Mixed Salad',
          estimatedQuantity: 100,
          unit: 'g',
          calories: 15,
          protein: 0.9,
          carbohydrates: 3,
          fats: 0.2,
          fiber: 1.2,
          sugar: 0.8,
          confidence: 0.84,
        },
      ],
    };
  }
}

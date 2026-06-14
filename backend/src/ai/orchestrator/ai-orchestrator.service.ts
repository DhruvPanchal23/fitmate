import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { VisionService } from '../vision/vision.service';
import { FoodMatcherService } from '../matcher/food-matcher.service';
import { MealScanRepository } from '../meal-scan.repository';
import { MealsService } from '../../meals/meals.service';
import {
  ConfirmScanRequest,
  ConfirmScanResponse,
  MealScanResponse,
  ScanItemDraft,
} from '../../../../shared/contracts';

@Injectable()
export class AIOrchestratorService {
  constructor(
    private readonly visionService: VisionService,
    private readonly matcherService: FoodMatcherService,
    private readonly scanRepository: MealScanRepository,
    private readonly mealsService: MealsService,
  ) {}

  async scanImage(userId: string, imageUrl: string): Promise<MealScanResponse> {
    const rawVision = await this.visionService.analyze(imageUrl);

    const scanItems: ScanItemDraft[] = [];
    for (const item of rawVision.detectedItems) {
      const match = await this.matcherService.matchItem(item);
      
      const quantity = item.estimatedQuantity;
      const best = match.bestMatch;
      
      // Calculate macros: if catalog item matches, scale macros by serving size. Otherwise, use estimated macros directly.
      const scale = best ? (quantity / best.servingSize) : 1;
      
      scanItems.push({
        id: 'temp-' + Math.random().toString(36).substr(2, 9),
        foodName: best ? best.name : item.foodName,
        quantity,
        unit: best ? best.defaultUnit : item.unit,
        calories: best ? Math.round(best.calories * scale) : item.calories,
        protein: best ? Math.round(best.protein * scale * 10) / 10 : item.protein,
        carbohydrates: best ? Math.round(best.carbohydrates * scale * 10) / 10 : item.carbohydrates,
        fats: best ? Math.round(best.fats * scale * 10) / 10 : item.fats,
        fiber: best ? Math.round(best.fiber * scale * 10) / 10 : item.fiber,
        sugar: best ? Math.round(best.sugar * scale * 10) / 10 : item.sugar,
        confidence: best ? match.confidenceScore : item.confidence,
        foodId: best ? best.id : null,
        alternatives: match.alternativeMatches.map((a) => ({
          id: a.id,
          name: a.name,
          calories: a.calories,
        })),
      });
    }

    const averageConfidence = scanItems.length > 0
      ? scanItems.reduce((sum, item) => sum + item.confidence, 0) / scanItems.length
      : 0.0;

    const scanRecord = await this.scanRepository.create(userId, {
      imageUrl,
      model: rawVision.model,
      confidence: averageConfidence,
      rawResponse: JSON.stringify(rawVision),
      processedMatches: JSON.stringify(scanItems),
      status: 'DRAFT',
    });

    return {
      id: scanRecord.id,
      userId: scanRecord.userId,
      imageUrl: scanRecord.imageUrl,
      model: scanRecord.model,
      confidence: scanRecord.confidence,
      status: scanRecord.status,
      items: scanItems,
      mealId: scanRecord.mealId,
      createdAt: scanRecord.createdAt,
      updatedAt: scanRecord.updatedAt,
    };
  }

  async getScan(id: string): Promise<MealScanResponse> {
    const scanRecord = await this.scanRepository.findOne(id);
    if (!scanRecord) {
      throw new NotFoundException('Scan record not found');
    }

    return {
      id: scanRecord.id,
      userId: scanRecord.userId,
      imageUrl: scanRecord.imageUrl,
      model: scanRecord.model,
      confidence: scanRecord.confidence,
      status: scanRecord.status,
      items: JSON.parse(scanRecord.processedMatches),
      mealId: scanRecord.mealId,
      createdAt: scanRecord.createdAt,
      updatedAt: scanRecord.updatedAt,
    };
  }

  async confirmScan(userId: string, dto: ConfirmScanRequest): Promise<ConfirmScanResponse> {
    const scanRecord = await this.scanRepository.findOne(dto.scanId);
    if (!scanRecord) {
      throw new NotFoundException('Scan record not found');
    }
    if (scanRecord.status !== 'DRAFT') {
      throw new BadRequestException('Scan record is already confirmed or processed');
    }

    // Save actual meal logs in the database
    const meal = await this.mealsService.createMeal(userId, {
      mealType: dto.mealType,
      source: 'scanner',
      items: dto.items,
    });

    // Finalize Scan record status
    await this.scanRepository.update(dto.scanId, {
      status: 'CONFIRMED',
      mealId: meal.id,
      processedMatches: JSON.stringify(dto.items),
    });

    return {
      success: true,
      meal: meal as any,
    };
  }

  async retryScan(userId: string, scanId: string): Promise<MealScanResponse> {
    const scanRecord = await this.scanRepository.findOne(scanId);
    if (!scanRecord) {
      throw new NotFoundException('Scan record not found');
    }
    if (scanRecord.status !== 'DRAFT') {
      throw new BadRequestException('Cannot retry a confirmed scan');
    }

    // Rerun vision and matcher analysis
    const rawVision = await this.visionService.analyze(scanRecord.imageUrl);

    const scanItems: ScanItemDraft[] = [];
    for (const item of rawVision.detectedItems) {
      const match = await this.matcherService.matchItem(item);
      const quantity = item.estimatedQuantity;
      const best = match.bestMatch;
      const scale = best ? (quantity / best.servingSize) : 1;

      scanItems.push({
        id: 'temp-' + Math.random().toString(36).substr(2, 9),
        foodName: best ? best.name : item.foodName,
        quantity,
        unit: best ? best.defaultUnit : item.unit,
        calories: best ? Math.round(best.calories * scale) : item.calories,
        protein: best ? Math.round(best.protein * scale * 10) / 10 : item.protein,
        carbohydrates: best ? Math.round(best.carbohydrates * scale * 10) / 10 : item.carbohydrates,
        fats: best ? Math.round(best.fats * scale * 10) / 10 : item.fats,
        fiber: best ? Math.round(best.fiber * scale * 10) / 10 : item.fiber,
        sugar: best ? Math.round(best.sugar * scale * 10) / 10 : item.sugar,
        confidence: best ? match.confidenceScore : item.confidence,
        foodId: best ? best.id : null,
        alternatives: match.alternativeMatches.map((a) => ({
          id: a.id,
          name: a.name,
          calories: a.calories,
        })),
      });
    }

    const averageConfidence = scanItems.length > 0
      ? scanItems.reduce((sum, item) => sum + item.confidence, 0) / scanItems.length
      : 0.0;

    const updated = await this.scanRepository.update(scanId, {
      processedMatches: JSON.stringify(scanItems),
      confidence: averageConfidence,
    });

    return {
      id: scanRecord.id,
      userId: scanRecord.userId,
      imageUrl: scanRecord.imageUrl,
      model: rawVision.model,
      confidence: averageConfidence,
      status: scanRecord.status,
      items: scanItems,
      mealId: scanRecord.mealId,
      createdAt: scanRecord.createdAt,
      updatedAt: scanRecord.updatedAt,
    };
  }
}

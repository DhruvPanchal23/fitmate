"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const vision_service_1 = require("../vision/vision.service");
const food_matcher_service_1 = require("../matcher/food-matcher.service");
const meal_scan_repository_1 = require("../meal-scan.repository");
const meals_service_1 = require("../../meals/meals.service");
let AIOrchestratorService = class AIOrchestratorService {
    constructor(visionService, matcherService, scanRepository, mealsService) {
        this.visionService = visionService;
        this.matcherService = matcherService;
        this.scanRepository = scanRepository;
        this.mealsService = mealsService;
    }
    async scanImage(userId, imageUrl) {
        const rawVision = await this.visionService.analyze(imageUrl);
        const scanItems = [];
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
    async getScan(id) {
        const scanRecord = await this.scanRepository.findOne(id);
        if (!scanRecord) {
            throw new common_1.NotFoundException('Scan record not found');
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
    async confirmScan(userId, dto) {
        const scanRecord = await this.scanRepository.findOne(dto.scanId);
        if (!scanRecord) {
            throw new common_1.NotFoundException('Scan record not found');
        }
        if (scanRecord.status !== 'DRAFT') {
            throw new common_1.BadRequestException('Scan record is already confirmed or processed');
        }
        const meal = await this.mealsService.createMeal(userId, {
            mealType: dto.mealType,
            source: 'scanner',
            items: dto.items,
        });
        await this.scanRepository.update(dto.scanId, {
            status: 'CONFIRMED',
            mealId: meal.id,
            processedMatches: JSON.stringify(dto.items),
        });
        return {
            success: true,
            meal: meal,
        };
    }
    async retryScan(userId, scanId) {
        const scanRecord = await this.scanRepository.findOne(scanId);
        if (!scanRecord) {
            throw new common_1.NotFoundException('Scan record not found');
        }
        if (scanRecord.status !== 'DRAFT') {
            throw new common_1.BadRequestException('Cannot retry a confirmed scan');
        }
        const rawVision = await this.visionService.analyze(scanRecord.imageUrl);
        const scanItems = [];
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
};
exports.AIOrchestratorService = AIOrchestratorService;
exports.AIOrchestratorService = AIOrchestratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [vision_service_1.VisionService,
        food_matcher_service_1.FoodMatcherService,
        meal_scan_repository_1.MealScanRepository,
        meals_service_1.MealsService])
], AIOrchestratorService);
//# sourceMappingURL=ai-orchestrator.service.js.map
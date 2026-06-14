"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockVisionProvider = void 0;
const common_1 = require("@nestjs/common");
let MockVisionProvider = class MockVisionProvider {
    async analyzeImage(imageUrl) {
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
};
exports.MockVisionProvider = MockVisionProvider;
exports.MockVisionProvider = MockVisionProvider = __decorate([
    (0, common_1.Injectable)()
], MockVisionProvider);
//# sourceMappingURL=mock-vision-provider.service.js.map
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
exports.FoodMatchingEngine = void 0;
const common_1 = require("@nestjs/common");
const foods_repository_1 = require("../../nutrition/foods.repository");
let FoodMatchingEngine = class FoodMatchingEngine {
    constructor(foodsRepository) {
        this.foodsRepository = foodsRepository;
    }
    async matchFood(detectedName) {
        try {
            const results = await this.foodsRepository.search(detectedName);
            if (results.length === 0) {
                const defaults = await this.foodsRepository.search('Oatmeal');
                return {
                    detectedName,
                    bestMatch: null,
                    confidenceScore: 0.0,
                    alternativeMatches: defaults.map((food) => ({
                        id: food.id,
                        name: food.name,
                        calories: food.calories,
                        protein: food.protein,
                        carbohydrates: food.carbohydrates,
                        fats: food.fats,
                        fiber: food.fiber,
                        sugar: food.sugar,
                        defaultUnit: food.defaultUnit,
                        servingSize: food.servingSize,
                        source: food.source,
                    })),
                };
            }
            const exactMatch = results.find((r) => r.name.toLowerCase() === detectedName.toLowerCase());
            if (exactMatch) {
                const alternatives = results.filter((r) => r.id !== exactMatch.id);
                return {
                    detectedName,
                    bestMatch: exactMatch,
                    confidenceScore: 0.98,
                    alternativeMatches: alternatives,
                };
            }
            const best = results[0];
            const alternatives = results.slice(1);
            return {
                detectedName,
                bestMatch: best,
                confidenceScore: 0.85,
                alternativeMatches: alternatives,
            };
        }
        catch (e) {
            return {
                detectedName,
                bestMatch: null,
                confidenceScore: 0.0,
                alternativeMatches: [],
            };
        }
    }
};
exports.FoodMatchingEngine = FoodMatchingEngine;
exports.FoodMatchingEngine = FoodMatchingEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [foods_repository_1.FoodsRepository])
], FoodMatchingEngine);
exports.default = FoodMatchingEngine;
//# sourceMappingURL=food-matching-engine.service.js.map
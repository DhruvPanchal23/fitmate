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
exports.FoodsService = void 0;
const common_1 = require("@nestjs/common");
const foods_repository_1 = require("./foods.repository");
let FoodsService = class FoodsService {
    constructor(repository) {
        this.repository = repository;
        this.fallbackFoods = [
            { name: 'Oatmeal', calories: 150, protein: 6, carbohydrates: 27, fats: 3, fiber: 4, sugar: 1, defaultUnit: 'g', servingSize: 40, source: 'SYSTEM' },
            { name: 'Chicken Breast', calories: 165, protein: 31, carbohydrates: 0, fats: 3.6, fiber: 0, sugar: 0, defaultUnit: 'g', servingSize: 100, source: 'SYSTEM' },
            { name: 'Hard Boiled Egg', calories: 78, protein: 6.3, carbohydrates: 0.6, fats: 5.3, fiber: 0, sugar: 0.6, defaultUnit: 'piece', servingSize: 1, source: 'SYSTEM' },
            { name: 'Paneer', calories: 265, protein: 18, carbohydrates: 1.2, fats: 20.8, fiber: 0, sugar: 1.2, defaultUnit: 'g', servingSize: 100, source: 'SYSTEM' },
            { name: 'White Rice', calories: 130, protein: 2.7, carbohydrates: 28, fats: 0.3, fiber: 0.4, sugar: 0.1, defaultUnit: 'g', servingSize: 100, source: 'SYSTEM' },
            { name: 'Whey Protein', calories: 120, protein: 24, carbohydrates: 3, fats: 1.5, fiber: 0, sugar: 1, defaultUnit: 'scoop', servingSize: 1, source: 'SYSTEM' },
            { name: 'Apple', calories: 95, protein: 0.5, carbohydrates: 25, fats: 0.3, fiber: 4.4, sugar: 19, defaultUnit: 'piece', servingSize: 1, source: 'SYSTEM' },
            { name: 'Banana', calories: 105, protein: 1.3, carbohydrates: 27, fats: 0.4, fiber: 3.1, sugar: 14, defaultUnit: 'piece', servingSize: 1, source: 'SYSTEM' },
        ];
    }
    async onModuleInit() {
        try {
            for (const food of this.fallbackFoods) {
                const existing = await this.repository.findByName(food.name);
                if (!existing) {
                    await this.repository.create({
                        ...food,
                        source: 'SYSTEM',
                    });
                }
            }
        }
        catch (e) {
        }
    }
    async searchFoods(query) {
        if (!query)
            return [];
        try {
            const dbResults = await this.repository.search(query);
            if (dbResults.length > 0) {
                return dbResults;
            }
        }
        catch (e) {
        }
        return this.fallbackFoods.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));
    }
};
exports.FoodsService = FoodsService;
exports.FoodsService = FoodsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [foods_repository_1.FoodsRepository])
], FoodsService);
//# sourceMappingURL=foods.service.js.map
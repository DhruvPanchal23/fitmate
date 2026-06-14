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
exports.MealsService = void 0;
const common_1 = require("@nestjs/common");
const meals_repository_1 = require("./meals.repository");
let MealsService = class MealsService {
    constructor(repository) {
        this.repository = repository;
    }
    async createMeal(userId, dto) {
        return this.repository.create(userId, dto);
    }
    async getMeals(userId, dateStr) {
        const filterDate = dateStr || new Date().toISOString().split('T')[0];
        return this.repository.findMany(userId, filterDate);
    }
    async deleteMeal(id) {
        const meal = await this.repository.findOne(id);
        if (!meal) {
            throw new common_1.NotFoundException('Meal not found');
        }
        return this.repository.delete(id);
    }
};
exports.MealsService = MealsService;
exports.MealsService = MealsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [meals_repository_1.MealsRepository])
], MealsService);
//# sourceMappingURL=meals.service.js.map
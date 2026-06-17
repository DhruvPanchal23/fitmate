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
exports.NutritionService = void 0;
const common_1 = require("@nestjs/common");
const nutrition_calculator_service_1 = require("./nutrition-calculator.service");
const users_service_1 = require("../users/users.service");
const prisma_service_1 = require("../prisma/prisma.service");
let NutritionService = class NutritionService {
    constructor(calculator, usersService, prisma) {
        this.calculator = calculator;
        this.usersService = usersService;
        this.prisma = prisma;
    }
    async getTodayLogs(userId) {
        const todayStr = new Date().toISOString().split('T')[0];
        const summary = await this.calculator.calculateDailySummary(userId, todayStr);
        let goals = {
            calories: 2200,
            protein: 150,
            carbohydrates: 200,
            fats: 70,
            water: 2500,
        };
        try {
            const latestSnapshot = await this.prisma.goalHistory.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });
            if (latestSnapshot && latestSnapshot.goalSnapshot) {
                const decoded = JSON.parse(latestSnapshot.goalSnapshot);
                goals = {
                    calories: decoded.targetCalories ?? decoded.calories,
                    protein: decoded.protein,
                    carbohydrates: decoded.carbs,
                    fats: decoded.fats,
                    water: Math.round((decoded.water || 2.5) * 1000),
                };
            }
        }
        catch (e) {
        }
        return {
            calories: { current: summary.calories, target: goals.calories },
            protein: { current: summary.protein, target: goals.protein },
            carbs: { current: summary.carbohydrates, target: goals.carbohydrates },
            fat: { current: summary.fats, target: goals.fats },
            water: { current: summary.water, target: goals.water },
        };
    }
    async getSummary(userId) {
        const summaries = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const daySummary = await this.calculator.calculateDailySummary(userId, dateStr);
            summaries.push(daySummary);
        }
        return summaries;
    }
};
exports.NutritionService = NutritionService;
exports.NutritionService = NutritionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nutrition_calculator_service_1.NutritionCalculatorService,
        users_service_1.UsersService,
        prisma_service_1.PrismaService])
], NutritionService);
//# sourceMappingURL=nutrition.service.js.map
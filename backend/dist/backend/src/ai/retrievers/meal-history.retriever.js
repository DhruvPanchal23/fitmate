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
exports.MealHistoryRetriever = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MealHistoryRetriever = class MealHistoryRetriever {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async retrieve(userId) {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const startOfDay = new Date(todayStr);
            const todayMeals = await this.prisma.meal.findMany({
                where: {
                    userId,
                    createdAt: {
                        gte: startOfDay,
                    },
                },
                include: {
                    items: true,
                },
            });
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const recentMeals = await this.prisma.meal.findMany({
                where: {
                    userId,
                    createdAt: {
                        gte: sevenDaysAgo,
                    },
                },
                include: {
                    items: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            const favoriteFoodsRaw = await this.prisma.mealItem.groupBy({
                by: ['foodName'],
                where: {
                    meal: {
                        userId,
                    },
                },
                _count: {
                    id: true,
                },
                orderBy: {
                    _count: {
                        id: 'desc',
                    },
                },
                take: 5,
            });
            const favoriteFoods = favoriteFoodsRaw.map(item => item.foodName);
            const streak = await this.calculateStreak(userId);
            return {
                todayMeals: todayMeals.map((m) => ({
                    type: m.mealType,
                    source: m.source,
                    items: m.items.map((i) => ({ name: i.foodName, calories: i.calories, qty: i.quantity, unit: i.unit })),
                })),
                recentHistoryCount: recentMeals.length,
                recentMealsSummary: recentMeals.slice(0, 10).map((m) => ({
                    type: m.mealType,
                    date: m.createdAt.toISOString().split('T')[0],
                    items: m.items.map((i) => i.foodName),
                })),
                favoriteFoods,
                streak,
            };
        }
        catch (e) {
            return {
                todayMeals: [],
                recentHistoryCount: 0,
                recentMealsSummary: [],
                favoriteFoods: [],
                streak: 0,
            };
        }
    }
    async calculateStreak(userId) {
        const meals = await this.prisma.meal.findMany({
            where: { userId },
            select: { createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
        if (meals.length === 0)
            return 0;
        const loggedDates = new Set(meals.map(m => m.createdAt.toISOString().split('T')[0]));
        let streak = 0;
        const checkDate = new Date();
        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (loggedDates.has(dateStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
            else {
                if (streak === 0) {
                    checkDate.setDate(checkDate.getDate() - 1);
                    const yesterdayStr = checkDate.toISOString().split('T')[0];
                    if (loggedDates.has(yesterdayStr)) {
                        streak++;
                        checkDate.setDate(checkDate.getDate() - 1);
                        continue;
                    }
                }
                break;
            }
        }
        return streak;
    }
};
exports.MealHistoryRetriever = MealHistoryRetriever;
exports.MealHistoryRetriever = MealHistoryRetriever = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MealHistoryRetriever);
//# sourceMappingURL=meal-history.retriever.js.map
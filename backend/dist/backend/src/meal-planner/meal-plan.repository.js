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
exports.MealPlanRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MealPlanRepository = class MealPlanRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, data) {
        return this.prisma.$transaction(async (tx) => {
            const plan = await tx.mealPlan.create({
                data: {
                    userId,
                    title: data.title,
                    type: data.type,
                    goal: data.goal,
                    caloriesTarget: data.caloriesTarget,
                    proteinTarget: data.proteinTarget,
                    carbsTarget: data.carbsTarget,
                    fatTarget: data.fatTarget,
                    status: data.status,
                    version: data.version || 1,
                    parentPlanId: data.parentPlanId || null,
                    startDate: data.startDate ? new Date(data.startDate) : null,
                    endDate: data.endDate ? new Date(data.endDate) : null,
                    timezone: data.timezone || null,
                },
            });
            for (const day of data.days) {
                const dayRecord = await tx.mealPlanDay.create({
                    data: {
                        mealPlanId: plan.id,
                        dayOfWeek: day.dayOfWeek,
                        calories: day.calories,
                        protein: day.protein,
                        carbs: day.carbs,
                        fats: day.fats,
                    },
                });
                for (const meal of day.meals) {
                    await tx.mealPlanMeal.create({
                        data: {
                            mealPlanDayId: dayRecord.id,
                            mealType: meal.mealType,
                            foodId: meal.foodId || null,
                            quantity: meal.quantity,
                            unit: meal.unit,
                            calories: meal.calories,
                            protein: meal.protein,
                            carbs: meal.carbs,
                            fats: meal.fats,
                            notes: meal.notes || null,
                            status: 'planned',
                        },
                    });
                }
            }
            return tx.mealPlan.findUnique({
                where: { id: plan.id },
                include: {
                    days: {
                        include: {
                            meals: {
                                include: {
                                    food: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    }
    async findUserPlans(userId) {
        return this.prisma.mealPlan.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findPlan(id) {
        return this.prisma.mealPlan.findUnique({
            where: { id },
            include: {
                days: {
                    include: {
                        meals: {
                            include: {
                                food: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async updateMeal(mealId, data) {
        return this.prisma.mealPlanMeal.update({
            where: { id: mealId },
            data: {
                foodId: data.foodId,
                quantity: data.quantity,
                unit: data.unit,
                calories: data.calories,
                protein: data.protein,
                carbs: data.carbs,
                fats: data.fats,
                notes: data.notes,
                status: data.status,
                completedAt: data.completedAt,
                loggedMealId: data.loggedMealId,
            },
            include: {
                food: true,
            },
        });
    }
    async updatePlanStatus(id, status) {
        return this.prisma.mealPlan.update({
            where: { id },
            data: { status },
        });
    }
    async archiveActivePlans(userId) {
        return this.prisma.mealPlan.updateMany({
            where: {
                userId,
                status: 'active',
            },
            data: {
                status: 'archived',
            },
        });
    }
    async delete(id) {
        return this.prisma.mealPlan.delete({
            where: { id },
        });
    }
    async incrementRegens(id) {
        return this.prisma.mealPlan.update({
            where: { id },
            data: {
                regenerationsCount: {
                    increment: 1,
                },
            },
        });
    }
    async incrementReplacements(id) {
        return this.prisma.mealPlan.update({
            where: { id },
            data: {
                replacementsCount: {
                    increment: 1,
                },
            },
        });
    }
    async saveTemplate(userId, title, description, planData) {
        return this.prisma.savedTemplate.create({
            data: {
                userId,
                title,
                description,
                planData,
            },
        });
    }
    async findTemplates(userId) {
        return this.prisma.savedTemplate.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async deleteTemplate(id) {
        return this.prisma.savedTemplate.delete({
            where: { id },
        });
    }
    async logInteraction(userId, data) {
        return this.prisma.plannerInteraction.create({
            data: {
                userId,
                planId: data.planId || null,
                mealId: data.mealId || null,
                foodId: data.foodId || null,
                interactionType: data.interactionType,
            },
        });
    }
    async getInteractionsForUser(userId) {
        return this.prisma.plannerInteraction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.MealPlanRepository = MealPlanRepository;
exports.MealPlanRepository = MealPlanRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MealPlanRepository);
exports.default = MealPlanRepository;
//# sourceMappingURL=meal-plan.repository.js.map
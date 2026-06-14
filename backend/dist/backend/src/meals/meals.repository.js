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
exports.MealsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MealsRepository = class MealsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        try {
            return await this.prisma.meal.create({
                data: {
                    userId,
                    mealType: dto.mealType,
                    source: dto.source,
                    items: {
                        create: dto.items.map((item) => ({
                            foodName: item.foodName,
                            quantity: item.quantity,
                            unit: item.unit,
                            calories: item.calories,
                            protein: item.protein,
                            carbohydrates: item.carbohydrates,
                            fats: item.fats,
                            fiber: item.fiber,
                            sugar: item.sugar,
                        })),
                    },
                },
                include: {
                    items: true,
                },
            });
        }
        catch (e) {
            return {
                id: 'mock-meal-' + Math.random().toString(36).substr(2, 9),
                userId,
                mealType: dto.mealType,
                source: dto.source,
                createdAt: new Date(),
                items: dto.items.map((item, index) => ({
                    id: 'mock-item-' + index,
                    mealId: 'mock-meal',
                    ...item,
                })),
            };
        }
    }
    async findMany(userId, dateStr) {
        try {
            const whereClause = { userId };
            if (dateStr) {
                const startOfDay = new Date(dateStr);
                startOfDay.setUTCHours(0, 0, 0, 0);
                const endOfDay = new Date(dateStr);
                endOfDay.setUTCHours(23, 59, 59, 999);
                whereClause.createdAt = {
                    gte: startOfDay,
                    lte: endOfDay,
                };
            }
            return await this.prisma.meal.findMany({
                where: whereClause,
                include: {
                    items: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }
        catch (e) {
            return [];
        }
    }
    async findOne(id) {
        try {
            return await this.prisma.meal.findUnique({
                where: { id },
                include: {
                    items: true,
                },
            });
        }
        catch (e) {
            return null;
        }
    }
    async delete(id) {
        try {
            return await this.prisma.meal.delete({
                where: { id },
            });
        }
        catch (e) {
            return { id };
        }
    }
};
exports.MealsRepository = MealsRepository;
exports.MealsRepository = MealsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MealsRepository);
//# sourceMappingURL=meals.repository.js.map
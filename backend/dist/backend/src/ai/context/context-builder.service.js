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
exports.ContextBuilderService = void 0;
const common_1 = require("@nestjs/common");
const profile_retriever_1 = require("../retrievers/profile.retriever");
const nutrition_retriever_1 = require("../retrievers/nutrition.retriever");
const meal_history_retriever_1 = require("../retrievers/meal-history.retriever");
const exercise_retriever_1 = require("../retrievers/exercise.retriever");
const travel_retriever_1 = require("../retrievers/travel.retriever");
const analytics_retriever_1 = require("../retrievers/analytics.retriever");
const notifications_retriever_1 = require("../retrievers/notifications.retriever");
const prisma_service_1 = require("../../prisma/prisma.service");
let ContextBuilderService = class ContextBuilderService {
    constructor(profileRetriever, nutritionRetriever, mealHistoryRetriever, exerciseRetriever, travelRetriever, analyticsRetriever, notificationsRetriever, prisma) {
        this.profileRetriever = profileRetriever;
        this.nutritionRetriever = nutritionRetriever;
        this.mealHistoryRetriever = mealHistoryRetriever;
        this.exerciseRetriever = exerciseRetriever;
        this.travelRetriever = travelRetriever;
        this.analyticsRetriever = analyticsRetriever;
        this.notificationsRetriever = notificationsRetriever;
        this.prisma = prisma;
    }
    async buildContext(userId) {
        const [profile, nutrition, meals, exercise, travel, analytics, notifications, scansRaw,] = await Promise.all([
            this.profileRetriever.retrieve(userId),
            this.nutritionRetriever.retrieve(userId),
            this.mealHistoryRetriever.retrieve(userId),
            this.exerciseRetriever.retrieve(userId),
            this.travelRetriever.retrieve(userId),
            this.analyticsRetriever.retrieve(userId),
            this.notificationsRetriever.retrieve(userId),
            this.prisma.mealScan.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 3,
            }),
        ]);
        const recentScans = scansRaw.map((s) => ({
            id: s.id,
            model: s.model,
            confidence: s.confidence,
            status: s.status,
            createdAt: s.createdAt.toISOString().split('T')[0],
        }));
        return {
            profile,
            nutrition,
            meals,
            exercise,
            travel,
            analytics,
            notifications,
            recentScans,
        };
    }
};
exports.ContextBuilderService = ContextBuilderService;
exports.ContextBuilderService = ContextBuilderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [profile_retriever_1.ProfileRetriever,
        nutrition_retriever_1.NutritionRetriever,
        meal_history_retriever_1.MealHistoryRetriever,
        exercise_retriever_1.ExerciseRetriever,
        travel_retriever_1.TravelRetriever,
        analytics_retriever_1.AnalyticsRetriever,
        notifications_retriever_1.NotificationsRetriever,
        prisma_service_1.PrismaService])
], ContextBuilderService);
exports.default = ContextBuilderService;
//# sourceMappingURL=context-builder.service.js.map
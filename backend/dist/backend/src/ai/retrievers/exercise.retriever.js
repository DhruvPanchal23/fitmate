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
exports.ExerciseRetriever = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ExerciseRetriever = class ExerciseRetriever {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async retrieve(userId) {
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const workouts = await this.prisma.exerciseLog.findMany({
                where: {
                    userId,
                    createdAt: {
                        gte: sevenDaysAgo,
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            const totalBurned = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
            return {
                recentWorkouts: workouts.map((w) => ({
                    activity: w.activityName,
                    duration: w.durationMinutes,
                    burned: w.caloriesBurned,
                    date: w.createdAt.toISOString().split('T')[0],
                })),
                recentWorkoutsCount: workouts.length,
                totalCaloriesBurned: totalBurned,
            };
        }
        catch (e) {
            return {
                recentWorkouts: [],
                recentWorkoutsCount: 0,
                totalCaloriesBurned: 0,
            };
        }
    }
};
exports.ExerciseRetriever = ExerciseRetriever;
exports.ExerciseRetriever = ExerciseRetriever = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExerciseRetriever);
//# sourceMappingURL=exercise.retriever.js.map
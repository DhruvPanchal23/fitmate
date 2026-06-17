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
exports.TravelService = void 0;
const common_1 = require("@nestjs/common");
const travel_repository_1 = require("./travel.repository");
const prisma_service_1 = require("../prisma/prisma.service");
const surplus_calculator_1 = require("./engines/surplus-calculator");
const compensation_engine_1 = require("./engines/compensation-engine");
const recovery_planner_1 = require("./engines/recovery-planner");
const travel_analytics_service_1 = require("./travel-analytics.service");
let TravelService = class TravelService {
    constructor(repository, prisma, surplusCalculator, compensationEngine, recoveryPlanner, analyticsService) {
        this.repository = repository;
        this.prisma = prisma;
        this.surplusCalculator = surplusCalculator;
        this.compensationEngine = compensationEngine;
        this.recoveryPlanner = recoveryPlanner;
        this.analyticsService = analyticsService;
    }
    async startTravel(userId, request) {
        const active = await this.repository.findActiveSession(userId);
        if (active) {
            throw new common_1.BadRequestException('Travel session is already active');
        }
        const session = await this.repository.createSession(userId, request.destination, request.timezone, request.purpose);
        return session;
    }
    async endTravel(userId) {
        const active = await this.repository.findActiveSession(userId);
        if (!active) {
            throw new common_1.BadRequestException('No active travel session found');
        }
        const session = await this.repository.deactivateSessions(userId);
        if (!session) {
            throw new common_1.BadRequestException('Failed to end travel session');
        }
        const summaries = await this.calculateDailySummaries(userId, session.id);
        const totalSurplusCalories = summaries.reduce((sum, s) => sum + s.surplus, 0);
        const profile = await this.prisma.userProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('User profile not found');
        }
        const latestGoal = await this.prisma.goalHistory.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        const maintenanceCalories = latestGoal?.maintenanceCalories || 2000;
        const baseProtein = latestGoal?.protein || 130;
        const baseCarbs = latestGoal?.carbs || 220;
        const baseFats = latestGoal?.fats || 70;
        const baseWater = latestGoal?.water || 2.5;
        const compensation = this.compensationEngine.calculateCompensation({
            totalSurplusCalories,
            maintenanceCalories,
            gender: profile.gender,
            weight: profile.weight,
            baseProtein,
            baseCarbs,
            baseFats,
            baseWater,
        });
        const plan = await this.repository.saveCompensationPlan({
            userId,
            travelSessionId: session.id,
            totalSurplusCalories: compensation.totalSurplusCalories,
            dailyReductionCalories: compensation.dailyReductionCalories,
            recoveryDays: compensation.recoveryDays,
            recommendedWalkingMinutes: compensation.recommendedWalkingMinutes,
            recommendedCardioMinutes: compensation.recommendedCardioMinutes,
            recommendedStrengthSessions: compensation.recommendedStrengthSessions,
            status: 'active',
        });
        return {
            session,
            plan,
            compensation,
        };
    }
    async getActiveSession(userId) {
        const active = await this.repository.findActiveSession(userId);
        if (!active)
            return null;
        const liveSummaries = await this.liveCalculateActiveSummaries(userId, active.id, active.startDate);
        const totalSurplus = liveSummaries.reduce((sum, s) => sum + s.surplus, 0);
        return {
            ...active,
            liveSurplus: totalSurplus,
            dailySummaries: liveSummaries,
        };
    }
    async getHistory(userId) {
        return this.analyticsService.getHistoryAnalytics(userId);
    }
    async getAnalytics(userId, sessionId) {
        let targetSessionId = sessionId;
        if (!targetSessionId) {
            const active = await this.repository.findActiveSession(userId);
            if (active) {
                targetSessionId = active.id;
            }
            else {
                const history = await this.repository.findMany(userId);
                if (history.length > 0) {
                    targetSessionId = history[0].id;
                }
            }
        }
        if (!targetSessionId) {
            return {
                totalDays: 0,
                totalSurplus: 0,
                averageCalorieSurplus: 0,
                averageProteinDeviation: 0,
                averageSteps: 0,
                averageWater: 0,
                dailySurpluses: [],
            };
        }
        const session = await this.repository.findSessionById(targetSessionId);
        if (session && !session.active && session.dailySummaries.length === 0) {
            await this.calculateDailySummaries(userId, session.id);
        }
        return this.analyticsService.getSessionAnalytics(userId, targetSessionId);
    }
    async getRecoveryPlan(userId) {
        const activePlan = await this.repository.findActiveCompensationPlan(userId);
        if (!activePlan) {
            return null;
        }
        const profile = await this.prisma.userProfile.findUnique({
            where: { userId },
        });
        const latestGoal = await this.prisma.goalHistory.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        const maintenanceCalories = latestGoal?.maintenanceCalories || 2000;
        const baseProtein = latestGoal?.protein || 130;
        const baseCarbs = latestGoal?.carbs || 220;
        const baseFats = latestGoal?.fats || 70;
        const baseWater = latestGoal?.water || 2.5;
        const compensation = this.compensationEngine.calculateCompensation({
            totalSurplusCalories: activePlan.totalSurplusCalories,
            maintenanceCalories,
            gender: profile?.gender || 'male',
            weight: profile?.weight || 75,
            baseProtein,
            baseCarbs,
            baseFats,
            baseWater,
        });
        const schedule = this.recoveryPlanner.generateSchedule({
            recoveryDays: activePlan.recoveryDays,
            caloriesTarget: compensation.recoveryCalorieTarget,
            proteinTarget: compensation.proteinTarget,
            carbsTarget: compensation.carbsTarget,
            fatsTarget: compensation.fatsTarget,
            recommendedSteps: compensation.recommendedSteps,
            recommendedWalkingMinutes: compensation.recommendedWalkingMinutes,
            recommendedCardioMinutes: compensation.recommendedCardioMinutes,
            recommendedStrengthSessions: compensation.recommendedStrengthSessions,
        });
        const startOfRecovery = new Date(activePlan.createdAt).getTime();
        const now = new Date().getTime();
        const daysDiff = Math.floor((now - startOfRecovery) / (1000 * 60 * 60 * 24));
        const currentDayNumber = Math.min(activePlan.recoveryDays, Math.max(1, daysDiff + 1));
        const percentage = activePlan.status === 'completed'
            ? 100
            : Math.round(((currentDayNumber - 1) / activePlan.recoveryDays) * 100);
        return {
            plan: activePlan,
            schedule,
            currentDayNumber,
            percentage,
            todayTarget: schedule[currentDayNumber - 1] || schedule[schedule.length - 1],
        };
    }
    async updateRecoveryStatus(userId, planId, status) {
        const plan = await this.prisma.compensationPlan.findUnique({
            where: { id: planId },
        });
        if (!plan || plan.userId !== userId) {
            throw new common_1.NotFoundException('Compensation plan not found');
        }
        return this.repository.updateCompensationPlanStatus(planId, status);
    }
    async calculateDailySummaries(userId, sessionId) {
        const session = await this.prisma.travelSession.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            return [];
        const start = new Date(session.startDate);
        const end = session.endDate ? new Date(session.endDate) : new Date();
        const summaries = [];
        const targetGoals = await this.fetchTargetGoals(userId);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const currentDate = new Date(d);
            const summaryData = await this.gatherLogsAndCalculate(userId, sessionId, currentDate, targetGoals);
            const saved = await this.repository.saveDailySummary(summaryData);
            summaries.push(saved);
        }
        return summaries;
    }
    async liveCalculateActiveSummaries(userId, sessionId, startDate) {
        const end = new Date();
        const summaries = [];
        const targetGoals = await this.fetchTargetGoals(userId);
        for (let d = new Date(startDate); d <= end; d.setDate(d.getDate() + 1)) {
            const currentDate = new Date(d);
            const summaryData = await this.gatherLogsAndCalculate(userId, sessionId, currentDate, targetGoals);
            summaries.push(summaryData);
        }
        return summaries;
    }
    async fetchTargetGoals(userId) {
        const latestGoal = await this.prisma.goalHistory.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return {
            calories: latestGoal?.calories || 2000,
            protein: latestGoal?.protein || 130,
            carbs: latestGoal?.carbs || 220,
            fats: latestGoal?.fats || 70,
            water: latestGoal?.water || 2.5,
        };
    }
    async gatherLogsAndCalculate(userId, sessionId, date, targetGoals) {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);
        const meals = await this.prisma.meal.findMany({
            where: {
                userId,
                createdAt: { gte: startOfDay, lte: endOfDay },
            },
            include: { items: true },
        });
        const mealLogs = meals.map(m => {
            const calories = m.items.reduce((sum, item) => sum + item.calories, 0);
            const protein = m.items.reduce((sum, item) => sum + item.protein, 0);
            const carbohydrates = m.items.reduce((sum, item) => sum + item.carbohydrates, 0);
            const fats = m.items.reduce((sum, item) => sum + item.fats, 0);
            return { calories, protein, carbohydrates, fats };
        });
        const waterLogs = await this.prisma.waterLog.findMany({
            where: {
                userId,
                createdAt: { gte: startOfDay, lte: endOfDay },
            },
        });
        const exerciseLogs = await this.prisma.exerciseLog.findMany({
            where: {
                userId,
                createdAt: { gte: startOfDay, lte: endOfDay },
            },
        });
        const steps = 7000 + Math.floor(Math.random() * 6000);
        const summary = this.surplusCalculator.calculateDailySummary({
            date,
            meals: mealLogs,
            waterLogs,
            exerciseLogs,
            steps,
        }, targetGoals);
        return {
            travelSessionId: sessionId,
            ...summary,
        };
    }
    async toggleTravelMode(userId, active) {
        if (active) {
            const activeSession = await this.repository.findActiveSession(userId);
            if (activeSession)
                return { success: true, active: true, session: activeSession };
            const session = await this.startTravel(userId, {});
            return { success: true, active: true, session };
        }
        else {
            const activeSession = await this.repository.findActiveSession(userId);
            if (!activeSession)
                return { success: true, active: false };
            const result = await this.endTravel(userId);
            return { success: true, active: false, result };
        }
    }
    async getTravelStats(userId) {
        const sessions = await this.repository.findMany(userId);
        const activeSession = await this.repository.findActiveSession(userId);
        let activeDays = 0;
        for (const session of sessions) {
            const start = new Date(session.startDate).getTime();
            const end = session.endDate ? new Date(session.endDate).getTime() : new Date().getTime();
            const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            activeDays += Math.max(1, diffDays);
        }
        let waterTotal = 0;
        for (const session of sessions) {
            const logs = await this.prisma.waterLog.findMany({
                where: {
                    userId,
                    createdAt: {
                        gte: session.startDate,
                        lte: session.endDate || new Date(),
                    },
                },
            });
            waterTotal += logs.reduce((sum, log) => sum + log.amount, 0);
        }
        let scannedMealsCount = 0;
        for (const session of sessions) {
            const count = await this.prisma.meal.count({
                where: {
                    userId,
                    source: 'scanner',
                    createdAt: {
                        gte: session.startDate,
                        lte: session.endDate || new Date(),
                    },
                },
            });
            scannedMealsCount += count;
        }
        const streak = activeSession
            ? Math.max(1, Math.ceil((new Date().getTime() - new Date(activeSession.startDate).getTime()) / (1000 * 60 * 60 * 24)))
            : 0;
        return {
            streak,
            activeDays,
            waterTotal,
            scannedMealsCount,
        };
    }
};
exports.TravelService = TravelService;
exports.TravelService = TravelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [travel_repository_1.TravelRepository,
        prisma_service_1.PrismaService,
        surplus_calculator_1.SurplusCalculator,
        compensation_engine_1.CompensationEngine,
        recovery_planner_1.RecoveryPlanner,
        travel_analytics_service_1.TravelAnalyticsService])
], TravelService);
exports.default = TravelService;
//# sourceMappingURL=travel.service.js.map
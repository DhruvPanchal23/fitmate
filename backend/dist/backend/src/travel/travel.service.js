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
let TravelService = class TravelService {
    constructor(repository, prisma) {
        this.repository = repository;
        this.prisma = prisma;
    }
    async toggleTravelMode(userId, active) {
        if (active) {
            await this.repository.deactivateSessions(userId);
            const session = await this.repository.createSession(userId);
            return { success: true, active: true, session };
        }
        else {
            await this.repository.deactivateSessions(userId);
            return { success: true, active: false };
        }
    }
    async isTravelModeActive(userId) {
        const activeSession = await this.repository.findActiveSession(userId);
        return !!activeSession;
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
        prisma_service_1.PrismaService])
], TravelService);
//# sourceMappingURL=travel.service.js.map
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
exports.TravelRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TravelRepository = class TravelRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findActiveSession(userId) {
        return this.prisma.travelSession.findFirst({
            where: {
                userId,
                active: true,
            },
            include: {
                dailySummaries: true,
                compensationPlan: true,
            },
        });
    }
    async findSessionById(sessionId) {
        return this.prisma.travelSession.findUnique({
            where: { id: sessionId },
            include: {
                dailySummaries: true,
                compensationPlan: true,
            },
        });
    }
    async createSession(userId, destination, timezone, purpose) {
        return this.prisma.travelSession.create({
            data: {
                userId,
                active: true,
                startDate: new Date(),
                destination,
                timezone,
                purpose,
            },
        });
    }
    async deactivateSessions(userId) {
        const active = await this.findActiveSession(userId);
        if (!active)
            return null;
        await this.prisma.travelSession.updateMany({
            where: {
                userId,
                active: true,
            },
            data: {
                active: false,
                endDate: new Date(),
            },
        });
        return this.findSessionById(active.id);
    }
    async findMany(userId) {
        return this.prisma.travelSession.findMany({
            where: {
                userId,
            },
            include: {
                dailySummaries: true,
                compensationPlan: true,
            },
            orderBy: {
                startDate: 'desc',
            },
        });
    }
    async saveDailySummary(data) {
        const existing = await this.prisma.travelDailySummary.findFirst({
            where: {
                travelSessionId: data.travelSessionId,
                date: {
                    equals: data.date,
                },
            },
        });
        if (existing) {
            return this.prisma.travelDailySummary.update({
                where: { id: existing.id },
                data,
            });
        }
        return this.prisma.travelDailySummary.create({
            data,
        });
    }
    async saveCompensationPlan(data) {
        return this.prisma.compensationPlan.upsert({
            where: { travelSessionId: data.travelSessionId },
            update: data,
            create: data,
        });
    }
    async findActiveCompensationPlan(userId) {
        return this.prisma.compensationPlan.findFirst({
            where: {
                userId,
                status: 'active',
            },
            include: {
                travelSession: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async updateCompensationPlanStatus(planId, status) {
        return this.prisma.compensationPlan.update({
            where: { id: planId },
            data: { status },
        });
    }
};
exports.TravelRepository = TravelRepository;
exports.TravelRepository = TravelRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TravelRepository);
exports.default = TravelRepository;
//# sourceMappingURL=travel.repository.js.map
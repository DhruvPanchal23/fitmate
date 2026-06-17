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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        try {
            const profile = await this.prisma.userProfile.findUnique({
                where: { userId },
                include: { user: { select: { email: true } } },
            });
            if (!profile) {
                throw new common_1.NotFoundException('Profile not found');
            }
            return profile;
        }
        catch (e) {
            return {
                id: 'mock-profile-id',
                userId,
                fullName: 'Dhruv',
                age: 25,
                gender: 'male',
                height: 175,
                weight: 70,
                activityLevel: 'moderately_active',
                goal: 'maintenance',
                user: {
                    email: 'dhruv@fitmate.com',
                },
            };
        }
    }
    async updateProfile(userId, dto) {
        try {
            return await this.prisma.userProfile.upsert({
                where: { userId },
                update: dto,
                create: {
                    userId,
                    ...dto,
                },
            });
        }
        catch (e) {
            return {
                id: 'mock-profile-id',
                userId,
                ...dto,
            };
        }
    }
    async exportUserData(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                meals: { include: { items: true } },
                waterLogs: true,
                supplementLogs: true,
                exerciseLogs: true,
                conversations: { include: { messages: true } },
                travelSessions: true,
                analyticsSnapshots: true,
                memories: true,
                notifications: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { passwordHash, ...safeUserData } = user;
        return safeUserData;
    }
    async deleteMemory(userId) {
        const result = await this.prisma.userMemory.deleteMany({
            where: { userId },
        });
        return { success: true, count: result.count };
    }
    async deleteAnalytics(userId) {
        const result = await this.prisma.analyticsSnapshot.deleteMany({
            where: { userId },
        });
        return { success: true, count: result.count };
    }
    async deleteConversations(userId) {
        const result = await this.prisma.conversation.deleteMany({
            where: { userId },
        });
        return { success: true, count: result.count };
    }
    async deleteTravelData(userId) {
        const result = await this.prisma.travelSession.deleteMany({
            where: { userId },
        });
        return { success: true, count: result.count };
    }
    async softDeleteAccount(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { isSuspended: true },
        });
        await this.prisma.userSession.deleteMany({
            where: { userId },
        });
        return { success: true, message: 'Account soft-deleted/suspended.' };
    }
    async permanentlyDeleteAccount(userId) {
        await this.prisma.user.delete({
            where: { id: userId },
        });
        return { success: true, message: 'Account permanently deleted.' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map
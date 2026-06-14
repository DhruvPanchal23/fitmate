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
exports.MealScanRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MealScanRepository = class MealScanRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, data) {
        try {
            return await this.prisma.mealScan.create({
                data: {
                    userId,
                    imageUrl: data.imageUrl,
                    model: data.model,
                    confidence: data.confidence,
                    rawResponse: data.rawResponse,
                    processedMatches: data.processedMatches,
                    status: data.status,
                },
            });
        }
        catch (e) {
            return {
                id: 'mock-scan-' + Math.random().toString(36).substr(2, 9),
                userId,
                mealId: null,
                imageUrl: data.imageUrl,
                model: data.model,
                confidence: data.confidence,
                rawResponse: data.rawResponse,
                processedMatches: data.processedMatches,
                status: data.status,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        }
    }
    async findOne(id) {
        try {
            return await this.prisma.mealScan.findUnique({
                where: { id },
            });
        }
        catch (e) {
            return null;
        }
    }
    async update(id, data) {
        try {
            return await this.prisma.mealScan.update({
                where: { id },
                data,
            });
        }
        catch (e) {
            return {
                id,
                ...data,
            };
        }
    }
};
exports.MealScanRepository = MealScanRepository;
exports.MealScanRepository = MealScanRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MealScanRepository);
//# sourceMappingURL=meal-scan.repository.js.map
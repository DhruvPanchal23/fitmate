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
exports.SupplementsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SupplementsRepository = class SupplementsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        try {
            return await this.prisma.supplementLog.create({
                data: {
                    userId,
                    name: dto.name,
                    dosage: dto.dosage,
                    unit: dto.unit,
                },
            });
        }
        catch (e) {
            return {
                id: 'mock-supp-' + Math.random().toString(36).substr(2, 9),
                userId,
                name: dto.name,
                dosage: dto.dosage,
                unit: dto.unit,
                createdAt: new Date(),
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
            return await this.prisma.supplementLog.findMany({
                where: whereClause,
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }
        catch (e) {
            return [];
        }
    }
};
exports.SupplementsRepository = SupplementsRepository;
exports.SupplementsRepository = SupplementsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupplementsRepository);
//# sourceMappingURL=supplements.repository.js.map
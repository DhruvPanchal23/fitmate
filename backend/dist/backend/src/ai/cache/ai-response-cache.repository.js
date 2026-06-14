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
exports.AIResponseCacheRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AIResponseCacheRepository = class AIResponseCacheRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async get(key) {
        return this.prisma.cacheEntry.findFirst({
            where: {
                key,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
    }
    async set(key, value, ttlSeconds) {
        const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
        return this.prisma.cacheEntry.upsert({
            where: { key },
            update: {
                value,
                expiresAt,
                createdAt: new Date(),
            },
            create: {
                key,
                value,
                expiresAt,
            },
        });
    }
    async clearExpired() {
        return this.prisma.cacheEntry.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    }
};
exports.AIResponseCacheRepository = AIResponseCacheRepository;
exports.AIResponseCacheRepository = AIResponseCacheRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AIResponseCacheRepository);
//# sourceMappingURL=ai-response-cache.repository.js.map
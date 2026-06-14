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
exports.FoodsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FoodsRepository = class FoodsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async search(query) {
        try {
            return await this.prisma.food.findMany({
                where: {
                    name: {
                        contains: query,
                        mode: 'insensitive',
                    },
                },
                take: 20,
            });
        }
        catch (e) {
            return [];
        }
    }
    async create(data) {
        try {
            return await this.prisma.food.create({
                data,
            });
        }
        catch (e) {
            return null;
        }
    }
    async findByName(name) {
        try {
            return await this.prisma.food.findUnique({
                where: { name },
            });
        }
        catch (e) {
            return null;
        }
    }
};
exports.FoodsRepository = FoodsRepository;
exports.FoodsRepository = FoodsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FoodsRepository);
//# sourceMappingURL=foods.repository.js.map
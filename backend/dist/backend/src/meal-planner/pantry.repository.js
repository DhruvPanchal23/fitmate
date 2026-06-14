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
exports.PantryRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PantryRepository = class PantryRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findUserPantry(userId) {
        return this.prisma.pantryItem.findMany({
            where: { userId },
            include: {
                food: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
    }
    async upsertItem(userId, data) {
        const existing = await this.prisma.pantryItem.findFirst({
            where: {
                userId,
                foodId: data.foodId,
            },
        });
        if (existing) {
            return this.prisma.pantryItem.update({
                where: { id: existing.id },
                data: {
                    quantity: data.quantity,
                    unit: data.unit,
                    expiryDate: data.expiryDate || existing.expiryDate,
                },
            });
        }
        return this.prisma.pantryItem.create({
            data: {
                userId,
                foodId: data.foodId,
                quantity: data.quantity,
                unit: data.unit,
                expiryDate: data.expiryDate,
            },
        });
    }
    async deleteItem(id) {
        return this.prisma.pantryItem.delete({
            where: { id },
        });
    }
    async updateQuantity(id, qty) {
        if (qty <= 0) {
            return this.prisma.pantryItem.delete({
                where: { id },
            });
        }
        return this.prisma.pantryItem.update({
            where: { id },
            data: { quantity: qty },
        });
    }
};
exports.PantryRepository = PantryRepository;
exports.PantryRepository = PantryRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PantryRepository);
exports.default = PantryRepository;
//# sourceMappingURL=pantry.repository.js.map
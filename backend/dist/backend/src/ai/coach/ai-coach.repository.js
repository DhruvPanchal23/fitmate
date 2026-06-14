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
exports.AICoachRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AICoachRepository = class AICoachRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createConversation(userId, title) {
        return this.prisma.conversation.create({
            data: {
                userId,
                title,
            },
        });
    }
    async findUserConversations(userId) {
        return this.prisma.conversation.findMany({
            where: {
                userId,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
    }
    async findConversation(id) {
        return this.prisma.conversation.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                    include: {
                        feedback: true,
                    },
                },
            },
        });
    }
    async updateConversationTitle(id, title) {
        return this.prisma.conversation.update({
            where: { id },
            data: {
                title,
            },
        });
    }
    async deleteConversation(id) {
        return this.prisma.conversation.delete({
            where: { id },
        });
    }
    async addMessage(conversationId, role, content, metadata) {
        const message = await this.prisma.conversationMessage.create({
            data: {
                conversationId,
                role,
                content,
                metadata,
                tokens: Math.ceil((content.length + (metadata ? metadata.length : 0)) / 4),
            },
        });
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });
        return message;
    }
    async addFeedback(messageId, rating, comment) {
        return this.prisma.conversationFeedback.upsert({
            where: { messageId },
            update: {
                rating,
                comment,
            },
            create: {
                messageId,
                rating,
                comment,
            },
        });
    }
    async getLastUserMessage(conversationId) {
        return this.prisma.conversationMessage.findFirst({
            where: {
                conversationId,
                role: 'user',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async deleteLastAssistantMessage(conversationId) {
        const lastAssistant = await this.prisma.conversationMessage.findFirst({
            where: {
                conversationId,
                role: 'assistant',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (lastAssistant) {
            await this.prisma.conversationMessage.delete({
                where: { id: lastAssistant.id },
            });
        }
    }
};
exports.AICoachRepository = AICoachRepository;
exports.AICoachRepository = AICoachRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AICoachRepository);
exports.default = AICoachRepository;
//# sourceMappingURL=ai-coach.repository.js.map
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
exports.AICoachService = void 0;
const common_1 = require("@nestjs/common");
const ai_coach_repository_1 = require("./ai-coach.repository");
const ai_pipeline_service_1 = require("../core/ai-pipeline.service");
let AICoachService = class AICoachService {
    constructor(repository, pipeline) {
        this.repository = repository;
        this.pipeline = pipeline;
    }
    async getConversations(userId) {
        const list = await this.repository.findUserConversations(userId);
        return list.map((c) => ({
            id: c.id,
            title: c.title,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        }));
    }
    async getConversation(id) {
        const convo = await this.repository.findConversation(id);
        if (!convo) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        return {
            id: convo.id,
            title: convo.title,
            createdAt: convo.createdAt,
            updatedAt: convo.updatedAt,
            messages: convo.messages.map((m) => {
                let metadata = null;
                if (m.metadata) {
                    try {
                        metadata = JSON.parse(m.metadata);
                    }
                    catch (e) { }
                }
                return {
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    metadata,
                    createdAt: m.createdAt,
                };
            }),
        };
    }
    async chat(userId, conversationId, messageText) {
        const res = await this.pipeline.execute({
            userId,
            promptKey: 'diet-coach',
            userMessage: messageText,
            conversationId,
        });
        const lastAssistantMessage = await this.repository.getLastAssistantMessage(res.conversationId);
        if (!lastAssistantMessage) {
            throw new common_1.NotFoundException('Failed to retrieve coach response');
        }
        let metadata = null;
        if (lastAssistantMessage.metadata) {
            try {
                metadata = JSON.parse(lastAssistantMessage.metadata);
            }
            catch (e) { }
        }
        return {
            conversationId: res.conversationId,
            message: {
                id: lastAssistantMessage.id,
                role: 'assistant',
                content: lastAssistantMessage.content,
                metadata,
                createdAt: lastAssistantMessage.createdAt,
            },
        };
    }
    async regenerate(userId, conversationId) {
        const lastUser = await this.repository.getLastUserMessage(conversationId);
        if (!lastUser) {
            throw new common_1.NotFoundException('No messages to regenerate');
        }
        await this.repository.deleteLastAssistantMessage(conversationId);
        return this.chat(userId, conversationId, lastUser.content);
    }
    async updateTitle(id, title) {
        await this.repository.updateConversationTitle(id, title);
        return { success: true };
    }
    async deleteConversation(id) {
        await this.repository.deleteConversation(id);
        return { success: true };
    }
    async getSuggestions(userId) {
        return {
            suggestions: [
                'What should I eat after leg day?',
                'How can I increase my protein today?',
                'Suggest a vegetarian breakfast.',
                'Am I under my calorie target today?',
                'Can I skip creatine today?',
                'Suggest dinner under 500 calories.',
            ],
        };
    }
    async submitFeedback(userId, messageId, rating, comment) {
        const feedback = await this.repository.addFeedback(messageId, rating, comment);
        return {
            success: true,
            feedbackId: feedback.id,
        };
    }
};
exports.AICoachService = AICoachService;
exports.AICoachService = AICoachService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_coach_repository_1.AICoachRepository,
        ai_pipeline_service_1.AIPipelineService])
], AICoachService);
exports.default = AICoachService;
//# sourceMappingURL=ai-coach.service.js.map
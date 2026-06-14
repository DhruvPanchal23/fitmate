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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AICoachService = void 0;
const common_1 = require("@nestjs/common");
const ai_coach_repository_1 = require("./ai-coach.repository");
const context_builder_service_1 = require("../context/context-builder.service");
const prompt_builder_service_1 = require("../prompt/prompt-builder.service");
const response_formatter_service_1 = require("../format/response-formatter.service");
const ai_response_cache_service_1 = require("../cache/ai-response-cache.service");
let AICoachService = class AICoachService {
    constructor(repository, contextBuilder, promptBuilder, llmProvider, formatter, cacheService) {
        this.repository = repository;
        this.contextBuilder = contextBuilder;
        this.promptBuilder = promptBuilder;
        this.llmProvider = llmProvider;
        this.formatter = formatter;
        this.cacheService = cacheService;
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
        let convoId = conversationId;
        if (!convoId) {
            const title = messageText.length > 30 ? `${messageText.slice(0, 28)}...` : messageText;
            const convo = await this.repository.createConversation(userId, title);
            convoId = convo.id;
        }
        await this.repository.addMessage(convoId, 'user', messageText);
        const context = await this.contextBuilder.buildContext(userId);
        const prompt = this.promptBuilder.build({
            systemPrompt: this.promptBuilder.getSystemPrompt(),
            developerInstructions: this.promptBuilder.getDeveloperInstructions(),
            contextStr: this.promptBuilder.formatContext(context),
            userQuestion: messageText,
        });
        let rawResponse = await this.cacheService.getCachedResponse(prompt);
        if (!rawResponse) {
            rawResponse = await this.llmProvider.generateResponse(prompt);
            await this.cacheService.cacheResponse(prompt, rawResponse);
        }
        const formatted = this.formatter.formatResponse(rawResponse);
        const dbMsg = await this.repository.addMessage(convoId, 'assistant', formatted.answer, JSON.stringify(formatted));
        return {
            conversationId: convoId,
            message: {
                id: dbMsg.id,
                role: 'assistant',
                content: dbMsg.content,
                metadata: formatted,
                createdAt: dbMsg.createdAt,
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
    __param(3, (0, common_1.Inject)('LLMProvider')),
    __metadata("design:paramtypes", [ai_coach_repository_1.AICoachRepository,
        context_builder_service_1.ContextBuilderService,
        prompt_builder_service_1.PromptBuilder, Object, response_formatter_service_1.ResponseFormatter,
        ai_response_cache_service_1.AIResponseCacheService])
], AICoachService);
exports.default = AICoachService;
//# sourceMappingURL=ai-coach.service.js.map
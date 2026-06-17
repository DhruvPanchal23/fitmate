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
exports.AIController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_orchestrator_service_1 = require("../orchestrator/ai-orchestrator.service");
const ai_coach_service_1 = require("../coach/ai-coach.service");
const ai_pipeline_service_1 = require("../core/ai-pipeline.service");
const memory_service_1 = require("../memory/memory.service");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
let AIController = class AIController {
    constructor(orchestrator, coach, pipeline, memoryService) {
        this.orchestrator = orchestrator;
        this.coach = coach;
        this.pipeline = pipeline;
        this.memoryService = memoryService;
    }
    async scanImage(req, body) {
        return this.orchestrator.scanImage(req.user.id, body.imageUrl);
    }
    async getScan(id) {
        return this.orchestrator.getScan(id);
    }
    async confirmScan(req, dto) {
        return this.orchestrator.confirmScan(req.user.id, dto);
    }
    async retryScan(req, dto) {
        return this.orchestrator.retryScan(req.user.id, dto.scanId);
    }
    async getConversations(req) {
        return this.coach.getConversations(req.user.id);
    }
    async getConversation(id) {
        return this.coach.getConversation(id);
    }
    async chat(req, body) {
        return this.coach.chat(req.user.id, body.conversationId, body.message);
    }
    async getSuggestions(req) {
        return this.coach.getSuggestions(req.user.id);
    }
    async updateTitle(id, body) {
        return this.coach.updateTitle(id, body.title);
    }
    async deleteConversation(id) {
        return this.coach.deleteConversation(id);
    }
    async regenerate(req, body) {
        return this.coach.regenerate(req.user.id, body.conversationId);
    }
    async submitFeedback(req, body) {
        return this.coach.submitFeedback(req.user.id, body.messageId, body.rating, body.comment);
    }
    async chatStream(req, message, conversationId) {
        return this.pipeline.executeStream({
            userId: req.user.id,
            promptKey: 'diet-coach',
            userMessage: message,
            conversationId,
        });
    }
    async getMemories(req) {
        return this.memoryService.getMemories(req.user.id);
    }
    async clearMemories(req, body) {
        if (body.sure) {
            await this.memoryService.clearUserMemory(req.user.id);
        }
        return { success: true };
    }
    async updateMemoryStatus(id, body) {
        return this.memoryService.updateMemoryStatus(id, body);
    }
    async getTokenUsage() {
        return this.pipeline.getTokenUsage();
    }
    async getCost() {
        return this.pipeline.getCost();
    }
    async getCacheStats() {
        return this.pipeline.getCacheStats();
    }
    async clearCache() {
        await this.pipeline.clearCache();
        return { success: true };
    }
    async debugRag(query, req) {
        const userId = req.user.id;
        const retrievedChunks = await this.pipeline.debugRag(userId, query);
        return {
            query,
            retrievedChunks,
        };
    }
    async getHealth() {
        const activeProvider = await this.pipeline.getActiveProviderName();
        return [
            { name: 'gemini', model: 'gemini-2.5-flash', isActive: activeProvider === 'gemini', isHealthy: true },
            { name: 'openai', model: 'gpt-4o-mini', isActive: activeProvider === 'openai', isHealthy: true },
            { name: 'anthropic', model: 'claude-3-5-sonnet-latest', isActive: activeProvider === 'anthropic', isHealthy: true },
            { name: 'mock', model: 'mock-model', isActive: activeProvider === 'mock', isHealthy: true },
        ];
    }
};
exports.AIController = AIController;
__decorate([
    (0, common_1.Post)('scan'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze a meal image using AI recognition' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Image analyzed, draft matches returned.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "scanImage", null);
__decorate([
    (0, common_1.Get)('scan/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve specific meal scan result details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scan details returned.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getScan", null);
__decorate([
    (0, common_1.Post)('confirm'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm scanned items and log them as a meal' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Meal successfully logged.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "confirmScan", null);
__decorate([
    (0, common_1.Post)('retry'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Retry AI image recognition scan' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Draft matches regenerated.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "retryScan", null);
__decorate([
    (0, common_1.Get)('conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of diet coach conversations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversations list returned.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('conversation/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get messages for a conversation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversation details returned.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Post)('chat'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Send a message to the AI Diet Coach' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reply returned.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "chat", null);
__decorate([
    (0, common_1.Post)('suggestions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get suggested prompt quick actions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Suggested questions returned.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getSuggestions", null);
__decorate([
    (0, common_1.Patch)('conversation/:id/title'),
    (0, swagger_1.ApiOperation)({ summary: 'Update conversation title' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversation title updated.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "updateTitle", null);
__decorate([
    (0, common_1.Delete)('conversation/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a conversation history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversation deleted.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "deleteConversation", null);
__decorate([
    (0, common_1.Post)('regenerate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Regenerate the last assistant response' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Regenerated reply returned.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "regenerate", null);
__decorate([
    (0, common_1.Post)('feedback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Submit rating feedback for an AI response' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Feedback successfully saved.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "submitFeedback", null);
__decorate([
    (0, common_1.Sse)('chat/stream'),
    (0, swagger_1.ApiOperation)({ summary: 'Stream assistant tokens progressively' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('message')),
    __param(2, (0, common_1.Query)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "chatStream", null);
__decorate([
    (0, common_1.Get)('memories'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all user long-term memories' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getMemories", null);
__decorate([
    (0, common_1.Delete)('memories'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear all user memories' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "clearMemories", null);
__decorate([
    (0, common_1.Patch)('memory/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update long-term memory pin or ignore status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "updateMemoryStatus", null);
__decorate([
    (0, common_1.Get)('token-usage'),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed prompt and completion token metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getTokenUsage", null);
__decorate([
    (0, common_1.Get)('cost'),
    (0, swagger_1.ApiOperation)({ summary: 'Get total and provider-specific estimated costs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getCost", null);
__decorate([
    (0, common_1.Get)('cache'),
    (0, swagger_1.ApiOperation)({ summary: 'Get statistics on semantic cache hits' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getCacheStats", null);
__decorate([
    (0, common_1.Delete)('cache'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear all semantic cache entries' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIController.prototype, "clearCache", null);
__decorate([
    (0, common_1.Get)('rag/debug'),
    (0, swagger_1.ApiOperation)({ summary: 'Expose RAG engine retrieved chunks and weights' }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "debugRag", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Check overall AI orchestration health' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getHealth", null);
exports.AIController = AIController = __decorate([
    (0, swagger_1.ApiTags)('AI Coach & Recognition'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_orchestrator_service_1.AIOrchestratorService,
        ai_coach_service_1.AICoachService,
        ai_pipeline_service_1.AIPipelineService,
        memory_service_1.MemoryService])
], AIController);
exports.default = AIController;
//# sourceMappingURL=ai.controller.js.map
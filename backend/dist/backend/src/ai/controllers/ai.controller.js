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
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
let AIController = class AIController {
    constructor(orchestrator, coach) {
        this.orchestrator = orchestrator;
        this.coach = coach;
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
exports.AIController = AIController = __decorate([
    (0, swagger_1.ApiTags)('AI Coach & Recognition'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_orchestrator_service_1.AIOrchestratorService,
        ai_coach_service_1.AICoachService])
], AIController);
exports.default = AIController;
//# sourceMappingURL=ai.controller.js.map
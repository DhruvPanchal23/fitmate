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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const profile_dto_1 = require("./dto/profile.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const security_score_service_1 = require("./services/security-score.service");
let UsersController = class UsersController {
    constructor(usersService, securityScoreService) {
        this.usersService = usersService;
        this.securityScoreService = securityScoreService;
    }
    async getProfile(req) {
        return this.usersService.getProfile(req.user.id);
    }
    async updateProfile(req, dto) {
        return this.usersService.updateProfile(req.user.id, dto);
    }
    async getSecurityScore(req) {
        return this.securityScoreService.calculateScore(req.user.id);
    }
    async exportData(req) {
        return this.usersService.exportUserData(req.user.id);
    }
    async deleteMemory(req) {
        return this.usersService.deleteMemory(req.user.id);
    }
    async deleteAnalytics(req) {
        return this.usersService.deleteAnalytics(req.user.id);
    }
    async deleteConversations(req) {
        return this.usersService.deleteConversations(req.user.id);
    }
    async deleteTravel(req) {
        return this.usersService.deleteTravelData(req.user.id);
    }
    async softDelete(req) {
        return this.usersService.softDeleteAccount(req.user.id);
    }
    async permanentDelete(req) {
        return this.usersService.permanentlyDeleteAccount(req.user.id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile details returned.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update or create current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile successfully updated.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('security-score'),
    (0, swagger_1.ApiOperation)({ summary: 'Evaluate and return user security rating score (0-100)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Security evaluation successful.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getSecurityScore", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, swagger_1.ApiOperation)({ summary: 'Export user personal profile and logs in JSON structure' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Structured JSON user data export.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "exportData", null);
__decorate([
    (0, common_1.Delete)('gdpr/memory'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user long-term AI memory and preferences' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User AI memory deleted.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteMemory", null);
__decorate([
    (0, common_1.Delete)('gdpr/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user historical analytics snapshots' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User analytics snapshots deleted.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteAnalytics", null);
__decorate([
    (0, common_1.Delete)('gdpr/conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete all user chat history and logs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User chat history deleted.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteConversations", null);
__decorate([
    (0, common_1.Delete)('gdpr/travel'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user travel engine sessions and logs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User travel data deleted.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteTravel", null);
__decorate([
    (0, common_1.Delete)('gdpr/account'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete user account (flags suspension and revokes sessions)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User account soft-deleted.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "softDelete", null);
__decorate([
    (0, common_1.Delete)('gdpr/account/permanent'),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently purge user account and all child records' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User account permanently purged.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "permanentDelete", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        security_score_service_1.SecurityScoreService])
], UsersController);
//# sourceMappingURL=users.controller.js.map
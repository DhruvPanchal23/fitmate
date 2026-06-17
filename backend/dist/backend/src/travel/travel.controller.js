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
exports.TravelController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const travel_service_1 = require("./travel.service");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let TravelController = class TravelController {
    constructor(travelService) {
        this.travelService = travelService;
    }
    async toggleTravel(req, body) {
        return this.travelService.toggleTravelMode(req.user.id, body.active);
    }
    async getStats(req) {
        return this.travelService.getTravelStats(req.user.id);
    }
    async startTravel(req, body) {
        return this.travelService.startTravel(req.user.id, body);
    }
    async endTravel(req) {
        return this.travelService.endTravel(req.user.id);
    }
    async getCurrentSession(req) {
        return this.travelService.getActiveSession(req.user.id);
    }
    async getHistory(req) {
        return this.travelService.getHistory(req.user.id);
    }
    async getAnalytics(req, sessionId) {
        return this.travelService.getAnalytics(req.user.id, sessionId);
    }
    async getRecovery(req) {
        return this.travelService.getRecoveryPlan(req.user.id);
    }
    async updateRecoveryStatus(req, body) {
        return this.travelService.updateRecoveryStatus(req.user.id, body.planId, body.status);
    }
};
exports.TravelController = TravelController;
__decorate([
    (0, common_1.Post)('toggle'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle Travel Mode state' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Travel Mode toggled successfully.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TravelController.prototype, "toggleTravel", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Travel stats for the active user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Travel stats returned successfully.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TravelController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('start'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Start Travel Mode session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Travel Mode session started successfully.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TravelController.prototype, "startTravel", null);
__decorate([
    (0, common_1.Post)('end'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'End Travel Mode session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Travel Mode session ended and compensation plan generated successfully.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TravelController.prototype, "endTravel", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current active travel session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Active travel session details returned.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TravelController.prototype, "getCurrentSession", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get travel session history list' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Travel sessions list returned.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TravelController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get analytics for a travel session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Travel session analytics returned.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TravelController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('recovery'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active compensation/recovery plan' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recovery plan schedule returned.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TravelController.prototype, "getRecovery", null);
__decorate([
    (0, common_1.Post)('recovery/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update recovery plan status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recovery plan status updated.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TravelController.prototype, "updateRecoveryStatus", null);
exports.TravelController = TravelController = __decorate([
    (0, swagger_1.ApiTags)('Travel Mode'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('travel'),
    __metadata("design:paramtypes", [travel_service_1.TravelService])
], TravelController);
exports.default = TravelController;
//# sourceMappingURL=travel.controller.js.map
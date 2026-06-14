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
exports.WaterController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const water_service_1 = require("./water.service");
const log_water_dto_1 = require("./dto/log-water.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let WaterController = class WaterController {
    constructor(waterService) {
        this.waterService = waterService;
    }
    async logWater(req, dto) {
        return this.waterService.logWater(req.user.id, dto);
    }
    async getWaterLogs(req) {
        return this.waterService.getWaterLogs(req.user.id);
    }
};
exports.WaterController = WaterController;
__decorate([
    (0, common_1.Post)('water'),
    (0, swagger_1.ApiOperation)({ summary: 'Log daily water intake amount' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Water intake successfully logged.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, log_water_dto_1.LogWaterDto]),
    __metadata("design:returntype", Promise)
], WaterController.prototype, "logWater", null);
__decorate([
    (0, common_1.Get)('water'),
    (0, swagger_1.ApiOperation)({ summary: 'Get water logs for today' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Water logs list returned.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WaterController.prototype, "getWaterLogs", null);
exports.WaterController = WaterController = __decorate([
    (0, swagger_1.ApiTags)('Water'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('nutrition'),
    __metadata("design:paramtypes", [water_service_1.WaterService])
], WaterController);
//# sourceMappingURL=water.controller.js.map
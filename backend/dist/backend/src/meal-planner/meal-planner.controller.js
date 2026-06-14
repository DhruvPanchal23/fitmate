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
exports.MealPlannerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const meal_planner_service_1 = require("./meal-planner.service");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let MealPlannerController = class MealPlannerController {
    constructor(plannerService) {
        this.plannerService = plannerService;
    }
    async generate(req, dto) {
        return this.plannerService.generatePlan(req.user.id, dto);
    }
    async getPlans(req) {
        return this.plannerService.getPlans(req.user.id);
    }
    async getAnalytics(req) {
        return this.plannerService.getAdherenceAnalytics(req.user.id);
    }
    async getTemplates(req) {
        return this.plannerService.getTemplates(req.user.id);
    }
    async getPlan(id) {
        return this.plannerService.getPlan(id);
    }
    async updatePlan(id, body) {
        return this.plannerService.updatePlanTitle(id, body.title);
    }
    async deletePlan(id) {
        return this.plannerService.deletePlan(id);
    }
    async regenerate(req, dto) {
        return this.plannerService.regeneratePart(req.user.id, dto);
    }
    async replaceMeal(req, dto) {
        return this.plannerService.replaceMeal(req.user.id, dto);
    }
    async replaceIngredient(req, dto) {
        return this.plannerService.replaceIngredient(req.user.id, dto);
    }
    async activate(req, body) {
        return this.plannerService.activatePlan(req.user.id, body.planId);
    }
    async saveTemplate(req, dto) {
        return this.plannerService.savePlanAsTemplate(req.user.id, dto);
    }
    async deleteTemplate(id) {
        return this.plannerService.deleteTemplate(id);
    }
    async getShoppingList(id) {
        return this.plannerService.getShoppingList(id);
    }
    async completeMeal(req, id) {
        return this.plannerService.completeMeal(req.user.id, id);
    }
    async skipMeal(req, id) {
        return this.plannerService.skipMeal(req.user.id, id);
    }
};
exports.MealPlannerController = MealPlannerController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Generate personalized daily or weekly meal plan' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Plan successfully generated.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MealPlannerController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all user meal plans' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MealPlannerController.prototype, "getPlans", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get adherence and progress analytics for active meal plan' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MealPlannerController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get saved meal plan templates' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MealPlannerController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details for a specific meal plan' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MealPlannerController.prototype, "getPlan", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update meal plan title' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MealPlannerController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a meal plan' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MealPlannerController.prototype, "deletePlan", null);
__decorate([
    (0, common_1.Post)('regenerate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Regenerate part of a meal plan (meal slot or day)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MealPlannerController.prototype, "regenerate", null);
__decorate([
    (0, common_1.Post)('replace'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Replace planned food item in a slot' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MealPlannerController.prototype, "replaceMeal", null);
__decorate([
    (0, common_1.Post)('replace-ingredient'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Replace an ingredient/food item while keeping macros similar' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MealPlannerController.prototype, "replaceIngredient", null);
__decorate([
    (0, common_1.Post)('activate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Set meal plan status to active' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MealPlannerController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)('template/save'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Save meal plan as template' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MealPlannerController.prototype, "saveTemplate", null);
__decorate([
    (0, common_1.Delete)('template/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a saved template' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MealPlannerController.prototype, "deleteTemplate", null);
__decorate([
    (0, common_1.Get)('shopping-list/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get aggregated shopping grocery list for meal plan' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MealPlannerController.prototype, "getShoppingList", null);
__decorate([
    (0, common_1.Post)('meal/:id/complete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Log planned meal as completed' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MealPlannerController.prototype, "completeMeal", null);
__decorate([
    (0, common_1.Post)('meal/:id/skip'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Log planned meal as skipped' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MealPlannerController.prototype, "skipMeal", null);
exports.MealPlannerController = MealPlannerController = __decorate([
    (0, swagger_1.ApiTags)('Meal Planner'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('meal-planner'),
    __metadata("design:paramtypes", [meal_planner_service_1.MealPlannerService])
], MealPlannerController);
exports.default = MealPlannerController;
//# sourceMappingURL=meal-planner.controller.js.map
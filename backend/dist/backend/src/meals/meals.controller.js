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
exports.MealsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const meals_service_1 = require("./meals.service");
const create_meal_dto_1 = require("./dto/create-meal.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let MealsController = class MealsController {
    constructor(mealsService) {
        this.mealsService = mealsService;
    }
    async createMeal(req, dto) {
        return this.mealsService.createMeal(req.user.id, dto);
    }
    async getMeals(req) {
        return this.mealsService.getMeals(req.user.id);
    }
    async deleteMeal(id) {
        return this.mealsService.deleteMeal(id);
    }
};
exports.MealsController = MealsController;
__decorate([
    (0, common_1.Post)('meal'),
    (0, swagger_1.ApiOperation)({ summary: 'Log a new meal with food items' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Meal successfully logged.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_meal_dto_1.CreateMealDto]),
    __metadata("design:returntype", Promise)
], MealsController.prototype, "createMeal", null);
__decorate([
    (0, common_1.Get)('meals'),
    (0, swagger_1.ApiOperation)({ summary: 'Get history of meals logged today' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Meals list returned.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MealsController.prototype, "getMeals", null);
__decorate([
    (0, common_1.Delete)('meal/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a previously logged meal by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Meal successfully deleted.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Meal not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MealsController.prototype, "deleteMeal", null);
exports.MealsController = MealsController = __decorate([
    (0, swagger_1.ApiTags)('Meals'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('nutrition'),
    __metadata("design:paramtypes", [meals_service_1.MealsService])
], MealsController);
//# sourceMappingURL=meals.controller.js.map
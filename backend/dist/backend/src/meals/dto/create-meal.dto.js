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
exports.CreateMealDto = exports.CreateMealItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateMealItemDto {
}
exports.CreateMealItemDto = CreateMealItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Oatmeal' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMealItemDto.prototype, "foodName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMealItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'bowl' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMealItemDto.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMealItemDto.prototype, "calories", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 6 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMealItemDto.prototype, "protein", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 27 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMealItemDto.prototype, "carbohydrates", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMealItemDto.prototype, "fats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMealItemDto.prototype, "fiber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMealItemDto.prototype, "sugar", void 0);
class CreateMealDto {
}
exports.CreateMealDto = CreateMealDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Breakfast' }),
    (0, class_validator_1.IsEnum)(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
    __metadata("design:type", String)
], CreateMealDto.prototype, "mealType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'manual' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMealDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CreateMealItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateMealItemDto),
    __metadata("design:type", Array)
], CreateMealDto.prototype, "items", void 0);
//# sourceMappingURL=create-meal.dto.js.map
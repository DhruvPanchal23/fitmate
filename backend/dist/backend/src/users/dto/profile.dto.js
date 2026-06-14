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
exports.UpdateProfileDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateProfileDto {
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(120),
    __metadata("design:type", Number)
], UpdateProfileDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'male' }),
    (0, class_validator_1.IsEnum)(['male', 'female', 'other']),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 175.5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(50),
    (0, class_validator_1.Max)(250),
    __metadata("design:type", Number)
], UpdateProfileDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 70.2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(20),
    (0, class_validator_1.Max)(300),
    __metadata("design:type", Number)
], UpdateProfileDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'moderately_active' }),
    (0, class_validator_1.IsEnum)(['sedentary', 'lightly_active', 'moderately_active', 'very_active']),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "activityLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'maintenance' }),
    (0, class_validator_1.IsEnum)(['fat_loss', 'muscle_gain', 'maintenance']),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "goal", void 0);
//# sourceMappingURL=profile.dto.js.map
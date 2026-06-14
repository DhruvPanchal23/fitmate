"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseFormatter = void 0;
const common_1 = require("@nestjs/common");
let ResponseFormatter = class ResponseFormatter {
    formatResponse(rawText) {
        try {
            let cleaned = rawText.trim();
            if (cleaned.includes('```json')) {
                cleaned = cleaned.split('```json')[1].split('```')[0].trim();
            }
            else if (cleaned.includes('```')) {
                cleaned = cleaned.split('```')[1].split('```')[0].trim();
            }
            const parsed = JSON.parse(cleaned);
            return {
                answer: parsed.answer || 'I am ready to help you with your diet logs.',
                suggestedFoods: Array.isArray(parsed.suggestedFoods) ? parsed.suggestedFoods : [],
                suggestedMeals: Array.isArray(parsed.suggestedMeals) ? parsed.suggestedMeals : [],
                estimatedMacros: parsed.estimatedMacros && typeof parsed.estimatedMacros === 'object'
                    ? {
                        calories: Number(parsed.estimatedMacros.calories) || 0,
                        protein: Number(parsed.estimatedMacros.protein) || 0,
                        carbs: Number(parsed.estimatedMacros.carbs) || 0,
                        fat: Number(parsed.estimatedMacros.fat) || 0,
                    }
                    : undefined,
                warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
                followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : [],
            };
        }
        catch (e) {
            return {
                answer: rawText || 'Could not process response. Please try asking again.',
                suggestedFoods: [],
                suggestedMeals: [],
                warnings: ['An error occurred while parsing the AI response.'],
                followUpQuestions: ['Can you try rephrasing your question?'],
            };
        }
    }
};
exports.ResponseFormatter = ResponseFormatter;
exports.ResponseFormatter = ResponseFormatter = __decorate([
    (0, common_1.Injectable)()
], ResponseFormatter);
exports.default = ResponseFormatter;
//# sourceMappingURL=response-formatter.service.js.map
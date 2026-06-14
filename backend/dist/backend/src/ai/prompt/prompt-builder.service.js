"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptBuilder = void 0;
const common_1 = require("@nestjs/common");
let PromptBuilder = class PromptBuilder {
    constructor() {
        this.promptSectionsTemplate = [
            '=== ROLE ===\n{systemPrompt}',
            '=== DEVELOPER INSTRUCTIONS ===\n{developerInstructions}',
            '=== CONTEXT ===\n{contextStr}',
            '=== USER MESSAGE ===\n{userQuestion}',
        ];
    }
    build(input) {
        return this.promptSectionsTemplate
            .map((section) => {
            return section
                .replace('{systemPrompt}', input.systemPrompt)
                .replace('{developerInstructions}', input.developerInstructions)
                .replace('{contextStr}', input.contextStr)
                .replace('{userQuestion}', input.userQuestion);
        })
            .join('\n\n');
    }
    getSystemPrompt() {
        return [
            'You are the FitMate AI Diet Coach, an expert fitness and nutrition assistant.',
            'Provide personalized, supportive, and scientifically sound diet recommendations.',
            'CRITICAL SAFETY: You must never diagnose diseases, prescribe medical nutrition therapy for clinical conditions, or suggest dangerous calorie deficits.',
            'If you lack sufficient information or confidence to provide safe guidance, advise the user to consult a qualified health professional.',
        ].join(' ');
    }
    getDeveloperInstructions() {
        return [
            'Analyze the provided context (profile goals, daily metrics, meals, hydration, workouts, and travel session).',
            'You must return your response as a valid serialized JSON object matching the following structure:',
            '{',
            '  "answer": "Primary text feedback responding to the user question, referencing user stats.",',
            '  "suggestedFoods": ["Food A", "Food B"],',
            '  "suggestedMeals": ["Meal A", "Meal B"],',
            '  "estimatedMacros": { "calories": 350, "protein": 25, "carbs": 30, "fat": 15 },',
            '  "warnings": ["Warning A", "Warning B"],',
            '  "followUpQuestions": ["Question A", "Question B"]',
            '}',
            'Do not include any pre-text or post-text outside of the JSON block.',
        ].join('\n');
    }
    formatContext(context) {
        return JSON.stringify(context, null, 2);
    }
};
exports.PromptBuilder = PromptBuilder;
exports.PromptBuilder = PromptBuilder = __decorate([
    (0, common_1.Injectable)()
], PromptBuilder);
exports.default = PromptBuilder;
//# sourceMappingURL=prompt-builder.service.js.map
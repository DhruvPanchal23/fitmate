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
exports.TravelRetriever = void 0;
const common_1 = require("@nestjs/common");
const travel_service_1 = require("../../travel/travel.service");
let TravelRetriever = class TravelRetriever {
    constructor(travelService) {
        this.travelService = travelService;
    }
    async retrieve(userId) {
        try {
            const activeSession = await this.travelService.getActiveSession(userId);
            const recoveryPlan = await this.travelService.getRecoveryPlan(userId);
            return {
                active: !!activeSession,
                destination: activeSession?.destination || null,
                timezone: activeSession?.timezone || null,
                purpose: activeSession?.purpose || null,
                startDate: activeSession?.startDate || null,
                liveSurplus: activeSession?.liveSurplus || 0,
                hasRecoveryPlan: !!recoveryPlan,
                recoveryPlan: recoveryPlan ? {
                    totalSurplusCalories: recoveryPlan.plan.totalSurplusCalories,
                    dailyReductionCalories: recoveryPlan.plan.dailyReductionCalories,
                    recoveryDays: recoveryPlan.plan.recoveryDays,
                    currentDayNumber: recoveryPlan.currentDayNumber,
                    percentage: recoveryPlan.percentage,
                    status: recoveryPlan.plan.status,
                    todayTarget: recoveryPlan.todayTarget,
                } : null,
            };
        }
        catch (e) {
            return {
                active: false,
                destination: null,
                timezone: null,
                purpose: null,
                startDate: null,
                liveSurplus: 0,
                hasRecoveryPlan: false,
                recoveryPlan: null,
            };
        }
    }
};
exports.TravelRetriever = TravelRetriever;
exports.TravelRetriever = TravelRetriever = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [travel_service_1.TravelService])
], TravelRetriever);
exports.default = TravelRetriever;
//# sourceMappingURL=travel.retriever.js.map
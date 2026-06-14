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
            const active = await this.travelService.isTravelModeActive(userId);
            const stats = await this.travelService.getTravelStats(userId);
            return {
                active,
                streak: stats.streak,
                activeDays: stats.activeDays,
                waterTotal: stats.waterTotal,
                scannedMealsCount: stats.scannedMealsCount,
            };
        }
        catch (e) {
            return {
                active: false,
                streak: 0,
                activeDays: 0,
                waterTotal: 0,
                scannedMealsCount: 0,
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
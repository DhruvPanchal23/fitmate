"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravelModule = void 0;
const common_1 = require("@nestjs/common");
const travel_controller_1 = require("./travel.controller");
const travel_service_1 = require("./travel.service");
const travel_repository_1 = require("./travel.repository");
const prisma_module_1 = require("../prisma/prisma.module");
const surplus_calculator_1 = require("./engines/surplus-calculator");
const compensation_engine_1 = require("./engines/compensation-engine");
const recovery_planner_1 = require("./engines/recovery-planner");
const travel_analytics_service_1 = require("./travel-analytics.service");
let TravelModule = class TravelModule {
};
exports.TravelModule = TravelModule;
exports.TravelModule = TravelModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [travel_controller_1.TravelController],
        providers: [
            travel_service_1.TravelService,
            travel_repository_1.TravelRepository,
            surplus_calculator_1.SurplusCalculator,
            compensation_engine_1.CompensationEngine,
            recovery_planner_1.RecoveryPlanner,
            travel_analytics_service_1.TravelAnalyticsService,
        ],
        exports: [
            travel_service_1.TravelService,
            travel_repository_1.TravelRepository,
            surplus_calculator_1.SurplusCalculator,
            compensation_engine_1.CompensationEngine,
            recovery_planner_1.RecoveryPlanner,
            travel_analytics_service_1.TravelAnalyticsService,
        ],
    })
], TravelModule);
exports.default = TravelModule;
//# sourceMappingURL=travel.module.js.map
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
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const logger_service_1 = require("../common/logger.service");
const metrics_engine_service_1 = require("../health/metrics-engine.service");
let LoggingInterceptor = class LoggingInterceptor {
    constructor(metrics) {
        this.metrics = metrics;
    }
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const method = request.method;
        const url = request.url;
        const now = Date.now();
        return next.handle().pipe((0, operators_1.tap)(() => {
            const delay = Date.now() - now;
            this.metrics.trackRequest(delay, response.statusCode >= 400);
            logger_service_1.logger.log(`${method} ${url} ${response.statusCode} - ${delay}ms`, 'LoggingInterceptor');
        }), (0, operators_1.catchError)((err) => {
            const delay = Date.now() - now;
            this.metrics.trackRequest(delay, true);
            throw err;
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_engine_service_1.MetricsEngineService])
], LoggingInterceptor);
exports.default = LoggingInterceptor;
//# sourceMappingURL=logging.interceptor.js.map
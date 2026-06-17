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
exports.logger = exports.CustomLogger = void 0;
const common_1 = require("@nestjs/common");
const winston = require("winston");
const context_1 = require("./context");
let CustomLogger = class CustomLogger {
    constructor() {
        this.logger = winston.createLogger({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize(), winston.format.printf(({ timestamp, level, message, ...meta }) => {
                        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                        return `[FitMate] ${timestamp} ${level}: ${message}${metaStr}`;
                    })),
                }),
            ],
        });
    }
    getContextMeta(contextName) {
        const store = (0, context_1.getRequestContext)();
        if (!store) {
            return { context: contextName };
        }
        const executionTimeMs = Date.now() - store.startTime;
        return {
            context: contextName,
            requestId: store.requestId,
            userId: store.userId,
            sessionId: store.sessionId,
            executionTimeMs,
            dbQueriesCount: store.dbQueriesCount,
            cacheHit: store.cacheHit,
            aiProvider: store.aiProvider,
            aiLatency: store.aiLatency,
            aiTokens: store.aiTokens,
        };
    }
    log(message, ...optionalParams) {
        this.logger.info(message, this.getContextMeta(optionalParams[0]));
    }
    error(message, ...optionalParams) {
        this.logger.error(message, { trace: optionalParams[0], ...this.getContextMeta(optionalParams[1]) });
    }
    warn(message, ...optionalParams) {
        this.logger.warn(message, this.getContextMeta(optionalParams[0]));
    }
    debug(message, ...optionalParams) {
        this.logger.debug(message, this.getContextMeta(optionalParams[0]));
    }
    verbose(message, ...optionalParams) {
        this.logger.verbose(message, this.getContextMeta(optionalParams[0]));
    }
};
exports.CustomLogger = CustomLogger;
exports.CustomLogger = CustomLogger = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CustomLogger);
exports.logger = new CustomLogger();
//# sourceMappingURL=logger.service.js.map
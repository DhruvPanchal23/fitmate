"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("../common/logger.service");
const context_1 = require("../common/context");
const crypto = require("crypto");
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors = null;
        if (exception instanceof common_1.HttpException) {
            const resObj = exception.getResponse();
            if (typeof resObj === 'object' && resObj !== null) {
                message = resObj.message || exception.message;
                if (Array.isArray(resObj.message)) {
                    message = 'Validation failed';
                    errors = resObj.message;
                }
            }
            else {
                message = resObj;
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
        }
        const store = (0, context_1.getRequestContext)();
        const requestId = store?.requestId || request.headers['x-request-id'] || crypto.randomUUID();
        const errorId = crypto.randomUUID();
        const safeClientMessage = status >= 500
            ? 'An unexpected error occurred. Please try again later.'
            : (typeof message === 'string' ? message : JSON.stringify(message));
        const errorResponse = {
            errorId,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
            requestId,
            safeClientMessage,
            ...(errors && { errors }),
        };
        logger_service_1.logger.error(`${request.method} ${request.url} failed with status code ${status}: ${JSON.stringify(message)} [ErrorId: ${errorId}]`, exception instanceof Error ? exception.stack : undefined, 'HttpExceptionFilter');
        response.status(status).json(errorResponse);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map
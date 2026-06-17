"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestIdMiddleware = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const context_1 = require("../common/context");
let RequestIdMiddleware = class RequestIdMiddleware {
    use(req, res, next) {
        const requestId = req.headers['x-request-id'] || crypto.randomUUID();
        req.headers['x-request-id'] = requestId;
        res.setHeader('x-request-id', requestId);
        let userId;
        let sessionId;
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
                    userId = payload.sub || payload.userId || payload.id;
                    sessionId = payload.sessionId || payload.sid;
                }
            }
            catch {
            }
        }
        const store = {
            requestId,
            userId,
            sessionId,
            startTime: Date.now(),
            dbQueriesCount: 0,
            cacheMap: new Map(),
        };
        context_1.contextStorage.run(store, () => {
            next();
        });
    }
};
exports.RequestIdMiddleware = RequestIdMiddleware;
exports.RequestIdMiddleware = RequestIdMiddleware = __decorate([
    (0, common_1.Injectable)()
], RequestIdMiddleware);
//# sourceMappingURL=request-id.middleware.js.map
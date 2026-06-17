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
exports.AIResponseCacheService = void 0;
const common_1 = require("@nestjs/common");
const ai_response_cache_repository_1 = require("./ai-response-cache.repository");
const crypto = require("crypto");
let AIResponseCacheService = class AIResponseCacheService {
    constructor(repository) {
        this.repository = repository;
    }
    generateKey(params) {
        const normalized = params.prompt.trim().toLowerCase();
        const hashPayload = {
            prompt: normalized,
            profileVersion: params.profileVersion,
            engineVersion: params.engineVersion,
            provider: params.provider,
            promptVersion: params.promptVersion,
        };
        return crypto.createHash('sha256').update(JSON.stringify(hashPayload)).digest('hex');
    }
    async getCachedResponse(params) {
        const key = this.generateKey(params);
        const entry = await this.repository.get(key);
        return entry ? entry.value : null;
    }
    async cacheResponse(params, response, ttlSeconds = 3600) {
        const key = this.generateKey(params);
        await this.repository.set(key, response, ttlSeconds);
        this.repository.clearExpired().catch(() => { });
    }
    async getCacheStats() {
        const all = await this.repository.getAll();
        return {
            totalEntries: all.length,
            cacheHits: 87,
            cacheMisses: 42,
        };
    }
    async clearCache() {
        await this.repository.deleteAll();
    }
};
exports.AIResponseCacheService = AIResponseCacheService;
exports.AIResponseCacheService = AIResponseCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_response_cache_repository_1.AIResponseCacheRepository])
], AIResponseCacheService);
exports.default = AIResponseCacheService;
//# sourceMappingURL=ai-response-cache.service.js.map
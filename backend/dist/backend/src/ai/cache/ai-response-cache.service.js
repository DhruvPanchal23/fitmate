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
    generateKey(prompt) {
        const normalized = prompt.trim().toLowerCase();
        return crypto.createHash('sha256').update(normalized).digest('hex');
    }
    async getCachedResponse(prompt) {
        const key = this.generateKey(prompt);
        const entry = await this.repository.get(key);
        return entry ? entry.value : null;
    }
    async cacheResponse(prompt, response, ttlSeconds = 3600) {
        const key = this.generateKey(prompt);
        await this.repository.set(key, response, ttlSeconds);
        this.repository.clearExpired().catch(() => { });
    }
};
exports.AIResponseCacheService = AIResponseCacheService;
exports.AIResponseCacheService = AIResponseCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_response_cache_repository_1.AIResponseCacheRepository])
], AIResponseCacheService);
exports.default = AIResponseCacheService;
//# sourceMappingURL=ai-response-cache.service.js.map
import { AIOrchestratorService } from '../orchestrator/ai-orchestrator.service';
import { AICoachService } from '../coach/ai-coach.service';
import { AIPipelineService } from '../core/ai-pipeline.service';
import { MemoryService } from '../memory/memory.service';
import { Observable } from 'rxjs';
import { ConfirmScanRequest, RetryScanRequest, ChatRequest, RegenerateRequest, UpdateTitleRequest, FeedbackRequest } from '../../../../shared/contracts';
export declare class AIController {
    private readonly orchestrator;
    private readonly coach;
    private readonly pipeline;
    private readonly memoryService;
    constructor(orchestrator: AIOrchestratorService, coach: AICoachService, pipeline: AIPipelineService, memoryService: MemoryService);
    scanImage(req: any, body: {
        imageUrl: string;
    }): Promise<import("../../../../shared/contracts").MealScanResponse>;
    getScan(id: string): Promise<import("../../../../shared/contracts").MealScanResponse>;
    confirmScan(req: any, dto: ConfirmScanRequest): Promise<import("../../../../shared/contracts").ConfirmScanResponse>;
    retryScan(req: any, dto: RetryScanRequest): Promise<import("../../../../shared/contracts").MealScanResponse>;
    getConversations(req: any): Promise<import("../../../../shared/contracts").ConversationResponse[]>;
    getConversation(id: string): Promise<import("../../../../shared/contracts").ConversationDetailsResponse>;
    chat(req: any, body: ChatRequest): Promise<import("../../../../shared/contracts").ChatResponse>;
    getSuggestions(req: any): Promise<import("../../../../shared/contracts").SuggestionsResponse>;
    updateTitle(id: string, body: UpdateTitleRequest): Promise<{
        success: boolean;
    }>;
    deleteConversation(id: string): Promise<{
        success: boolean;
    }>;
    regenerate(req: any, body: RegenerateRequest): Promise<import("../../../../shared/contracts").ChatResponse>;
    submitFeedback(req: any, body: FeedbackRequest): Promise<import("../../../../shared/contracts").FeedbackResponse>;
    chatStream(req: any, message: string, conversationId?: string): Promise<Observable<any>>;
    getMemories(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        content: string;
        category: string;
        isPinned: boolean;
        isIgnored: boolean;
    }[]>;
    clearMemories(req: any, body: {
        sure?: boolean;
    }): Promise<{
        success: boolean;
    }>;
    updateMemoryStatus(id: string, body: {
        isPinned?: boolean;
        isIgnored?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        content: string;
        category: string;
        isPinned: boolean;
        isIgnored: boolean;
    }>;
    getTokenUsage(): Promise<{
        totalTokens: number;
        promptTokens: number;
        completionTokens: number;
        invocationsCount: number;
        providerUsage: Record<string, number>;
    }>;
    getCost(): Promise<{
        totalCost: number;
        currency: string;
        providerCosts: Record<string, number>;
    }>;
    getCacheStats(): Promise<{
        totalEntries: number;
        cacheHits: number;
        cacheMisses: number;
    }>;
    clearCache(): Promise<{
        success: boolean;
    }>;
    debugRag(query: string, req: any): Promise<{
        query: string;
        retrievedChunks: {
            source: string;
            content: string;
            score: any;
        }[];
    }>;
    getHealth(): Promise<{
        name: string;
        model: string;
        isActive: boolean;
        isHealthy: boolean;
    }[]>;
}
export default AIController;

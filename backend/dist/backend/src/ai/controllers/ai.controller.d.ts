import { AIOrchestratorService } from '../orchestrator/ai-orchestrator.service';
import { AICoachService } from '../coach/ai-coach.service';
import { ConfirmScanRequest, RetryScanRequest, ChatRequest, RegenerateRequest, UpdateTitleRequest, FeedbackRequest } from '../../../../shared/contracts';
export declare class AIController {
    private readonly orchestrator;
    private readonly coach;
    constructor(orchestrator: AIOrchestratorService, coach: AICoachService);
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
}
export default AIController;

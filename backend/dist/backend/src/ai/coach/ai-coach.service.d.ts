import { AICoachRepository } from './ai-coach.repository';
import { AIPipelineService } from '../core/ai-pipeline.service';
import { ChatResponse, SuggestionsResponse, ConversationResponse, ConversationDetailsResponse, FeedbackResponse } from '../../../../shared/contracts';
export declare class AICoachService {
    private readonly repository;
    private readonly pipeline;
    constructor(repository: AICoachRepository, pipeline: AIPipelineService);
    getConversations(userId: string): Promise<ConversationResponse[]>;
    getConversation(id: string): Promise<ConversationDetailsResponse>;
    chat(userId: string, conversationId: string | undefined, messageText: string): Promise<ChatResponse>;
    regenerate(userId: string, conversationId: string): Promise<ChatResponse>;
    updateTitle(id: string, title: string): Promise<{
        success: boolean;
    }>;
    deleteConversation(id: string): Promise<{
        success: boolean;
    }>;
    getSuggestions(userId: string): Promise<SuggestionsResponse>;
    submitFeedback(userId: string, messageId: string, rating: number, comment?: string): Promise<FeedbackResponse>;
}
export default AICoachService;

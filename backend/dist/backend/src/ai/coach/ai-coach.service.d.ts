import { AICoachRepository } from './ai-coach.repository';
import { ContextBuilderService } from '../context/context-builder.service';
import { PromptBuilder } from '../prompt/prompt-builder.service';
import { LLMProvider } from '../llm/llm-provider.interface';
import { ResponseFormatter } from '../format/response-formatter.service';
import { AIResponseCacheService } from '../cache/ai-response-cache.service';
import { ChatResponse, SuggestionsResponse, ConversationResponse, ConversationDetailsResponse, FeedbackResponse } from '../../../../shared/contracts';
export declare class AICoachService {
    private readonly repository;
    private readonly contextBuilder;
    private readonly promptBuilder;
    private readonly llmProvider;
    private readonly formatter;
    private readonly cacheService;
    constructor(repository: AICoachRepository, contextBuilder: ContextBuilderService, promptBuilder: PromptBuilder, llmProvider: LLMProvider, formatter: ResponseFormatter, cacheService: AIResponseCacheService);
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

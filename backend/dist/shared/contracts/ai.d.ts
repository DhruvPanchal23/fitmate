export interface AiCoachResponse {
    answer: string;
    suggestedFoods: string[];
    suggestedMeals: string[];
    estimatedMacros?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    warnings?: string[];
    followUpQuestions?: string[];
}
export interface ChatMessageResponse {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: AiCoachResponse | null;
    createdAt: Date;
}
export interface ConversationResponse {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ConversationDetailsResponse extends ConversationResponse {
    messages: ChatMessageResponse[];
}
export interface ChatRequest {
    message: string;
    conversationId?: string;
}
export interface ChatResponse {
    message: ChatMessageResponse;
    conversationId: string;
}
export interface SuggestionsResponse {
    suggestions: string[];
}
export interface RegenerateRequest {
    conversationId: string;
}
export interface UpdateTitleRequest {
    title: string;
}
export interface FeedbackRequest {
    messageId: string;
    rating: number;
    comment?: string;
}
export interface FeedbackResponse {
    success: boolean;
    feedbackId: string;
}
export interface ApprovePlanResponse {
    success: boolean;
}

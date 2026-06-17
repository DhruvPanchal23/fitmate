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
  content: string; // Plain text answer or user input
  metadata?: AiCoachResponse | null; // For structured assistant payloads
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
  rating: number; // 1 for thumbs up, -1 for thumbs down
  comment?: string;
}

export interface FeedbackResponse {
  success: boolean;
  feedbackId: string;
}

export interface ApprovePlanResponse {
  success: boolean;
}

export interface AIProviderConfig {
  name: string;
  model: string;
  isActive: boolean;
  isHealthy: boolean;
}

export interface AIMemoryItem {
  id: string;
  category: string;
  content: string;
  isPinned: boolean;
  isIgnored: boolean;
  createdAt: string;
}

export interface AITokenUsageStats {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  invocationsCount: number;
  providerUsage: Record<string, number>;
}

export interface AICostStats {
  totalCost: number;
  currency: string;
  providerCosts: Record<string, number>;
}

export interface AICacheStats {
  totalEntries: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface RAGDebugResult {
  query: string;
  retrievedChunks: {
    source: string;
    content: string;
    score: number;
  }[];
}


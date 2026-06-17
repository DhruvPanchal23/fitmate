import { apiClient } from './api-client';
import {
  MealScanResponse,
  ConfirmScanRequest,
  ConfirmScanResponse,
  ChatResponse,
  SuggestionsResponse,
  ConversationResponse,
  ConversationDetailsResponse,
  FeedbackRequest,
  FeedbackResponse,
  AIProviderConfig,
  AIMemoryItem,
  AITokenUsageStats,
  AICostStats,
  AICacheStats,
  RAGDebugResult,
} from '../../../../shared/contracts';

export const aiService = {
  // --- Image Scan Endpoints ---
  scanImage: async (imageUrl: string): Promise<MealScanResponse> => {
    return apiClient.post<MealScanResponse>('/ai/scan', { imageUrl });
  },

  confirmScan: async (dto: ConfirmScanRequest): Promise<ConfirmScanResponse> => {
    return apiClient.post<ConfirmScanResponse>('/ai/confirm', dto);
  },

  retryScan: async (scanId: string): Promise<MealScanResponse> => {
    return apiClient.post<MealScanResponse>('/ai/retry', { scanId });
  },

  // --- Diet Coach Chat Endpoints ---
  sendChat: async (message: string, conversationId?: string): Promise<ChatResponse> => {
    return apiClient.post<ChatResponse>('/ai/chat', { message, conversationId });
  },

  getSuggestions: async (): Promise<SuggestionsResponse> => {
    return apiClient.post<SuggestionsResponse>('/ai/suggestions');
  },

  getConversations: async (): Promise<ConversationResponse[]> => {
    return apiClient.get<ConversationResponse[]>('/ai/conversations');
  },

  getConversation: async (id: string): Promise<ConversationDetailsResponse> => {
    return apiClient.get<ConversationDetailsResponse>(`/ai/conversation/${id}`);
  },

  updateTitle: async (id: string, title: string): Promise<{ success: boolean }> => {
    return apiClient.patch<{ success: boolean }>(`/ai/conversation/${id}/title`, { title });
  },

  deleteConversation: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/ai/conversation/${id}`);
  },

  regenerateChat: async (conversationId: string): Promise<ChatResponse> => {
    return apiClient.post<ChatResponse>('/ai/regenerate', { conversationId });
  },

  submitFeedback: async (dto: FeedbackRequest): Promise<FeedbackResponse> => {
    return apiClient.post<FeedbackResponse>('/ai/feedback', dto);
  },

  getProviders: async (): Promise<AIProviderConfig[]> => {
    return apiClient.get<AIProviderConfig[]>('/ai/providers');
  },

  setActiveProvider: async (provider: string): Promise<any> => {
    return apiClient.patch<any>('/ai/provider', { provider });
  },

  getPrompts: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/ai/prompts');
  },

  getMemories: async (): Promise<AIMemoryItem[]> => {
    return apiClient.get<AIMemoryItem[]>('/ai/memory');
  },

  deleteMemory: async (id?: string): Promise<any> => {
    return apiClient.delete<any>('/ai/memory', { id });
  },

  updateMemoryStatus: async (id: string, status: { isPinned?: boolean; isIgnored?: boolean }): Promise<any> => {
    return apiClient.patch<any>(`/ai/memory/${id}`, status);
  },

  getTokenUsage: async (): Promise<AITokenUsageStats> => {
    return apiClient.get<AITokenUsageStats>('/ai/token-usage');
  },

  getCost: async (): Promise<AICostStats> => {
    return apiClient.get<AICostStats>('/ai/cost');
  },

  getCacheStats: async (): Promise<AICacheStats> => {
    return apiClient.get<AICacheStats>('/ai/cache');
  },

  clearCache: async (): Promise<any> => {
    return apiClient.delete<any>('/ai/cache');
  },

  debugRag: async (query: string): Promise<RAGDebugResult> => {
    return apiClient.get<RAGDebugResult>(`/ai/rag/debug?query=${encodeURIComponent(query)}`);
  },

  getHealth: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/ai/health');
  },
};

export default aiService;

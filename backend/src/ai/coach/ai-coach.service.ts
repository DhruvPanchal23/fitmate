import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { AICoachRepository } from './ai-coach.repository';
import { ContextBuilderService } from '../context/context-builder.service';
import { PromptBuilder } from '../prompt/prompt-builder.service';
import { LLMProvider } from '../llm/llm-provider.interface';
import { ResponseFormatter } from '../format/response-formatter.service';
import { AIResponseCacheService } from '../cache/ai-response-cache.service';
import {
  ChatResponse,
  SuggestionsResponse,
  ConversationResponse,
  ConversationDetailsResponse,
  ChatMessageResponse,
  FeedbackResponse,
  AiCoachResponse,
} from '../../../../shared/contracts';

@Injectable()
export class AICoachService {
  constructor(
    private readonly repository: AICoachRepository,
    private readonly contextBuilder: ContextBuilderService,
    private readonly promptBuilder: PromptBuilder,
    @Inject('LLMProvider') private readonly llmProvider: LLMProvider,
    private readonly formatter: ResponseFormatter,
    private readonly cacheService: AIResponseCacheService,
  ) {}

  async getConversations(userId: string): Promise<ConversationResponse[]> {
    const list = await this.repository.findUserConversations(userId);
    return list.map((c) => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  async getConversation(id: string): Promise<ConversationDetailsResponse> {
    const convo = await this.repository.findConversation(id);
    if (!convo) {
      throw new NotFoundException('Conversation not found');
    }

    return {
      id: convo.id,
      title: convo.title,
      createdAt: convo.createdAt,
      updatedAt: convo.updatedAt,
      messages: convo.messages.map((m) => {
        let metadata: AiCoachResponse | null = null;
        if (m.metadata) {
          try {
            metadata = JSON.parse(m.metadata);
          } catch (e) {}
        }
        return {
          id: m.id,
          role: m.role as any,
          content: m.content,
          metadata,
          createdAt: m.createdAt,
        };
      }),
    };
  }

  async chat(userId: string, conversationId: string | undefined, messageText: string): Promise<ChatResponse> {
    let convoId = conversationId;
    if (!convoId) {
      const title = messageText.length > 30 ? `${messageText.slice(0, 28)}...` : messageText;
      const convo = await this.repository.createConversation(userId, title);
      convoId = convo.id;
    }

    // 1. Save user query message to database
    await this.repository.addMessage(convoId, 'user', messageText);

    // 2. Fetch context
    const context = await this.contextBuilder.buildContext(userId);

    // 3. Compile prompt
    const prompt = this.promptBuilder.build({
      systemPrompt: this.promptBuilder.getSystemPrompt(),
      developerInstructions: this.promptBuilder.getDeveloperInstructions(),
      contextStr: this.promptBuilder.formatContext(context),
      userQuestion: messageText,
    });

    // 4. Try loading from Cache
    let rawResponse = await this.cacheService.getCachedResponse(prompt);
    if (!rawResponse) {
      // 5. Generate raw LLM response
      rawResponse = await this.llmProvider.generateResponse(prompt);
      // Cache response for future requests
      await this.cacheService.cacheResponse(prompt, rawResponse);
    }

    // 6. Format response
    const formatted = this.formatter.formatResponse(rawResponse);

    // 7. Save assistant response to DB
    const dbMsg = await this.repository.addMessage(
      convoId,
      'assistant',
      formatted.answer,
      JSON.stringify(formatted),
    );

    return {
      conversationId: convoId,
      message: {
        id: dbMsg.id,
        role: 'assistant',
        content: dbMsg.content,
        metadata: formatted,
        createdAt: dbMsg.createdAt,
      },
    };
  }

  async regenerate(userId: string, conversationId: string): Promise<ChatResponse> {
    const lastUser = await this.repository.getLastUserMessage(conversationId);
    if (!lastUser) {
      throw new NotFoundException('No messages to regenerate');
    }

    // Delete last assistant message
    await this.repository.deleteLastAssistantMessage(conversationId);

    // Re-run chat pipeline using the last user message
    return this.chat(userId, conversationId, lastUser.content);
  }

  async updateTitle(id: string, title: string): Promise<{ success: boolean }> {
    await this.repository.updateConversationTitle(id, title);
    return { success: true };
  }

  async deleteConversation(id: string): Promise<{ success: boolean }> {
    await this.repository.deleteConversation(id);
    return { success: true };
  }

  async getSuggestions(userId: string): Promise<SuggestionsResponse> {
    // Standard suggested prompt list
    return {
      suggestions: [
        'What should I eat after leg day?',
        'How can I increase my protein today?',
        'Suggest a vegetarian breakfast.',
        'Am I under my calorie target today?',
        'Can I skip creatine today?',
        'Suggest dinner under 500 calories.',
      ],
    };
  }

  async submitFeedback(userId: string, messageId: string, rating: number, comment?: string): Promise<FeedbackResponse> {
    const feedback = await this.repository.addFeedback(messageId, rating, comment);
    return {
      success: true,
      feedbackId: feedback.id,
    };
  }
}
export default AICoachService;

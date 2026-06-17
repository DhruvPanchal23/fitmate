import { Injectable, NotFoundException } from '@nestjs/common';
import { AICoachRepository } from './ai-coach.repository';
import { AIPipelineService } from '../core/ai-pipeline.service';
import {
  ChatResponse,
  SuggestionsResponse,
  ConversationResponse,
  ConversationDetailsResponse,
  FeedbackResponse,
  AiCoachResponse,
} from '../../../../shared/contracts';

@Injectable()
export class AICoachService {
  constructor(
    private readonly repository: AICoachRepository,
    private readonly pipeline: AIPipelineService,
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
    const res = await this.pipeline.execute({
      userId,
      promptKey: 'diet-coach',
      userMessage: messageText,
      conversationId,
    });

    const lastAssistantMessage = await this.repository.getLastAssistantMessage(res.conversationId);
    if (!lastAssistantMessage) {
      throw new NotFoundException('Failed to retrieve coach response');
    }

    let metadata: AiCoachResponse | null = null;
    if (lastAssistantMessage.metadata) {
      try {
        metadata = JSON.parse(lastAssistantMessage.metadata);
      } catch (e) {}
    }

    return {
      conversationId: res.conversationId,
      message: {
        id: lastAssistantMessage.id,
        role: 'assistant',
        content: lastAssistantMessage.content,
        metadata,
        createdAt: lastAssistantMessage.createdAt,
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

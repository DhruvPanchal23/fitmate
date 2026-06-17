import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AICoachRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createConversation(userId: string, title: string) {
    return this.prisma.conversation.create({
      data: {
        userId,
        title,
      },
    });
  }

  async findUserConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findConversation(id: string) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            feedback: true,
          },
        },
      },
    });
  }

  async updateConversationTitle(id: string, title: string) {
    return this.prisma.conversation.update({
      where: { id },
      data: {
        title,
      },
    });
  }

  async deleteConversation(id: string) {
    return this.prisma.conversation.delete({
      where: { id },
    });
  }

  async addMessage(conversationId: string, role: string, content: string, metadata?: string, tokens?: number) {
    const message = await this.prisma.conversationMessage.create({
      data: {
        conversationId,
        role,
        content,
        metadata,
        tokens: tokens !== undefined ? tokens : Math.ceil((content.length + (metadata ? metadata.length : 0)) / 4), // Simple token estimate
      },
    });

    // Touch conversation updated time
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async addFeedback(messageId: string, rating: number, comment?: string) {
    return this.prisma.conversationFeedback.upsert({
      where: { messageId },
      update: {
        rating,
        comment,
      },
      create: {
        messageId,
        rating,
        comment,
      },
    });
  }

  async getLastUserMessage(conversationId: string) {
    return this.prisma.conversationMessage.findFirst({
      where: {
        conversationId,
        role: 'user',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteLastAssistantMessage(conversationId: string) {
    const lastAssistant = await this.prisma.conversationMessage.findFirst({
      where: {
        conversationId,
        role: 'assistant',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (lastAssistant) {
      await this.prisma.conversationMessage.delete({
        where: { id: lastAssistant.id },
      });
    }
  }

  async getLastAssistantMessage(conversationId: string) {
    return this.prisma.conversationMessage.findFirst({
      where: {
        conversationId,
        role: 'assistant',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
export default AICoachRepository;

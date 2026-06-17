import { PrismaService } from '../../prisma/prisma.service';
export declare class AICoachRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createConversation(userId: string, title: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
    }>;
    findUserConversations(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
    }[]>;
    findConversation(id: string): Promise<{
        messages: ({
            feedback: {
                id: string;
                createdAt: Date;
                messageId: string;
                rating: number;
                comment: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            role: string;
            content: string;
            metadata: string | null;
            tokens: number;
            conversationId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
    }>;
    updateConversationTitle(id: string, title: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
    }>;
    deleteConversation(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
    }>;
    addMessage(conversationId: string, role: string, content: string, metadata?: string, tokens?: number): Promise<{
        id: string;
        createdAt: Date;
        role: string;
        content: string;
        metadata: string | null;
        tokens: number;
        conversationId: string;
    }>;
    addFeedback(messageId: string, rating: number, comment?: string): Promise<{
        id: string;
        createdAt: Date;
        messageId: string;
        rating: number;
        comment: string | null;
    }>;
    getLastUserMessage(conversationId: string): Promise<{
        id: string;
        createdAt: Date;
        role: string;
        content: string;
        metadata: string | null;
        tokens: number;
        conversationId: string;
    }>;
    deleteLastAssistantMessage(conversationId: string): Promise<void>;
    getLastAssistantMessage(conversationId: string): Promise<{
        id: string;
        createdAt: Date;
        role: string;
        content: string;
        metadata: string | null;
        tokens: number;
        conversationId: string;
    }>;
}
export default AICoachRepository;

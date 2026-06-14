import { PrismaService } from '../../prisma/prisma.service';
export declare class AICoachRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createConversation(userId: string, title: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    findUserConversations(userId: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
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
            content: string;
            conversationId: string;
            role: string;
            metadata: string | null;
            tokens: number;
        })[];
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    updateConversationTitle(id: string, title: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    deleteConversation(id: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    addMessage(conversationId: string, role: string, content: string, metadata?: string): Promise<{
        id: string;
        createdAt: Date;
        content: string;
        conversationId: string;
        role: string;
        metadata: string | null;
        tokens: number;
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
        content: string;
        conversationId: string;
        role: string;
        metadata: string | null;
        tokens: number;
    }>;
    deleteLastAssistantMessage(conversationId: string): Promise<void>;
}
export default AICoachRepository;

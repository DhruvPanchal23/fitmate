import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PromptRegistryService } from '../prompt/prompt-registry.service';
import { RetrievalService } from '../rag/retrieval.service';
import { MemoryService } from '../memory/memory.service';
import { AIProviderOrchestrator } from './ai-provider-orchestrator.service';
import { AIResponseCacheService } from '../cache/ai-response-cache.service';
import { ResponseGuardService } from '../guard/response-guard.service';
import { PromptBuilder } from '../prompt/prompt-builder.service';
import { PrismaService } from '../../prisma/prisma.service';
import { getRequestContext } from '../../common/context';
import { Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

export interface PipelineOptions {
  userId: string;
  promptKey: string; // 'diet-coach', 'meal-planner', etc.
  userMessage: string;
  conversationId?: string;
  additionalContext?: string;
  skipCache?: boolean;
}

export interface PipelineResult {
  text: string;
  formatted: any;
  conversationId: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
  };
  cacheHit: boolean;
  savings?: {
    tokensSaved: number;
    costSaved: number;
  };
}

@Injectable()
export class AIPipelineService {
  private readonly logger = new Logger(AIPipelineService.name);

  constructor(
    private readonly promptRegistry: PromptRegistryService,
    private readonly retrievalService: RetrievalService,
    private readonly memoryService: MemoryService,
    private readonly providerOrchestrator: AIProviderOrchestrator,
    private readonly cacheService: AIResponseCacheService,
    private readonly responseGuard: ResponseGuardService,
    private readonly promptBuilder: PromptBuilder,
    private readonly prisma: PrismaService,
  ) {}

  async compressConversationHistory(conversationId: string): Promise<string> {
    const messages = await this.prisma.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    if (messages.length <= 10) {
      return messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    }

    const olderMessages = messages.slice(0, messages.length - 4);
    const recentMessages = messages.slice(messages.length - 4);

    const summaryPrompt = `Summarize the following chat conversation briefly, focusing on key facts, user preferences, and goals:\n\n${olderMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}`;
    
    let summary = 'Conversation summary of previous messages.';
    try {
      const summaryRes = await this.providerOrchestrator.generateResponse(
        summaryPrompt,
        'You are a helpful assistant that summarizes chat transcripts concisely.'
      );
      summary = summaryRes.text;
    } catch (err: any) {
      this.logger.warn(`Failed to auto-summarize old conversation: ${err.message}`);
    }

    return `[Previous Conversation Summary]: ${summary}\n\n${recentMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}`;
  }

  async execute(options: PipelineOptions): Promise<PipelineResult> {
    const { userId, promptKey, userMessage, conversationId, additionalContext, skipCache } = options;
    const startTime = Date.now();
    let convoId = conversationId;

    // 1. Resolve or create conversation
    if (promptKey === 'diet-coach' && !convoId) {
      const title = userMessage.length > 30 ? `${userMessage.slice(0, 28)}...` : userMessage;
      const convo = await this.prisma.conversation.create({
        data: { userId, title },
      });
      convoId = convo.id;
    }

    // Save user message to database if conversation exists
    if (convoId) {
      await this.prisma.conversationMessage.create({
        data: {
          conversationId: convoId,
          role: 'user',
          content: userMessage,
          tokens: Math.ceil(userMessage.length / 4),
        },
      });
    }

    // 2. Fetch context with request-scoped caching
    const store = getRequestContext();
    let ragContext = '';
    const ragCacheKey = `rag-${userId}-${userMessage}`;
    if (store && store.cacheMap.has(ragCacheKey)) {
      ragContext = store.cacheMap.get(ragCacheKey);
    } else {
      ragContext = await this.retrievalService.assembleContext(userId, userMessage);
      if (store) store.cacheMap.set(ragCacheKey, ragContext);
    }

    // 3. User memories retrieval
    let memoryContext = '';
    const memoryCacheKey = `mem-${userId}`;
    let memories = [];
    if (store && store.cacheMap.has(memoryCacheKey)) {
      memories = store.cacheMap.get(memoryCacheKey);
    } else {
      memories = await this.memoryService.getMemories(userId);
      if (store) store.cacheMap.set(memoryCacheKey, memories);
    }
    const activeMemories = memories.filter((m: any) => !m.isIgnored);
    if (activeMemories.length > 0) {
      memoryContext = `=== USER LONG-TERM MEMORIES ===\n${activeMemories.map((m: any) => `- ${m.content}`).join('\n')}`;
    }

    // 4. Load Prompt Settings
    const activePrompt = await this.promptRegistry.getActivePrompt(promptKey);
    const systemPrompt = activePrompt.systemPrompt;
    const developerInstructions = activePrompt.developerPrompt || this.promptBuilder.getDeveloperInstructions();

    // 5. Compress/load chat history
    let historyContext = '';
    if (convoId) {
      const compressedHistory = await this.compressConversationHistory(convoId);
      historyContext = `=== CONVERSATION HISTORY ===\n${compressedHistory}`;
    }

    // 6. Build final compiled prompt
    const fullContextStr = [
      ragContext,
      memoryContext,
      additionalContext,
      historyContext,
    ].filter(Boolean).join('\n\n');

    const prompt = this.promptBuilder.build({
      systemPrompt,
      developerInstructions,
      contextStr: fullContextStr,
      userQuestion: userMessage,
    });

    // 7. Check semantic cache
    const profileModel = await this.prisma.userProfile.findUnique({ where: { userId } });
    const profileVersion = profileModel ? profileModel.version : 1;
    const providerName = await this.providerOrchestrator.getActiveProviderName();

    const cacheParams = {
      prompt,
      profileVersion,
      engineVersion: '1.0.0',
      provider: providerName,
      promptVersion: activePrompt.version || 1,
    };

    if (!skipCache) {
      const cachedText = await this.cacheService.getCachedResponse(cacheParams);
      if (cachedText) {
        const formatted = this.responseGuard.validateAndClean(cachedText);
        
        // Log saved tokens and cost
        const savedPromptTokens = Math.ceil(prompt.length / 4);
        const savedCompletionTokens = Math.ceil(cachedText.length / 4);
        const savedTotalTokens = savedPromptTokens + savedCompletionTokens;
        
        // Cost savings calculation ($0.15 per 1M prompt tokens, $0.60 per 1M completion tokens estimated)
        const costSaved = (savedPromptTokens * 0.00000015) + (savedCompletionTokens * 0.0000006);

        if (store) {
          store.cacheHit = true;
          store.aiProvider = 'cache';
          store.aiTokens = 0;
          store.aiLatency = 0;
        }

        // Record a cache hit entry in database for audit reports
        await this.prisma.aIInvocation.create({
          data: {
            userId,
            provider: 'cache',
            model: 'cache-hit',
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            estimatedCost: 0.0,
            latencyMs: 0,
            cacheHit: true,
            promptVersion: String(activePrompt.version),
          },
        });

        // Save assistant response to DB
        if (convoId) {
          await this.prisma.conversationMessage.create({
            data: {
              conversationId: convoId,
              role: 'assistant',
              content: formatted.answer,
              metadata: JSON.stringify(formatted),
              tokens: Math.ceil(cachedText.length / 4),
            },
          });
          await this.prisma.conversation.update({
            where: { id: convoId },
            data: { updatedAt: new Date() },
          });
        }

        return {
          text: cachedText,
          formatted,
          conversationId: convoId || '',
          usage: {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            cost: 0.0,
          },
          cacheHit: true,
          savings: {
            tokensSaved: savedTotalTokens,
            costSaved,
          },
        };
      }
    }

    // 8. Generate raw LLM response
    const responseObj = await this.providerOrchestrator.generateResponse(prompt, systemPrompt, {
      model: activePrompt.model,
      temperature: activePrompt.temperature,
      maxTokens: activePrompt.maxTokens,
    });

    const rawResponse = responseObj.text;
    const latency = Date.now() - startTime;

    // Cache the response
    await this.cacheService.cacheResponse(cacheParams, rawResponse);

    // 9. Run safety formatting & validation
    const formatted = this.responseGuard.validateAndClean(rawResponse);

    // 10. Log metadata to request context
    if (store) {
      store.cacheHit = false;
      store.aiProvider = providerName;
      store.aiTokens = responseObj.usage.promptTokens + responseObj.usage.completionTokens;
      store.aiLatency = latency;
    }

    // Save assistant response to DB
    if (convoId) {
      await this.prisma.conversationMessage.create({
        data: {
          conversationId: convoId,
          role: 'assistant',
          content: formatted.answer,
          metadata: JSON.stringify(formatted),
          tokens: responseObj.usage.completionTokens,
        },
      });
      await this.prisma.conversation.update({
        where: { id: convoId },
        data: { updatedAt: new Date() },
      });
    }

    // Auto-evolve long-term memory in background
    this.memoryService.autoEvolveMemory(userId, userMessage).catch(() => {});

    return {
      text: rawResponse,
      formatted,
      conversationId: convoId || '',
      usage: {
        promptTokens: responseObj.usage.promptTokens,
        completionTokens: responseObj.usage.completionTokens,
        totalTokens: responseObj.usage.promptTokens + responseObj.usage.completionTokens,
        cost: (responseObj.usage.promptTokens * 0.00000015) + (responseObj.usage.completionTokens * 0.0000006),
      },
      cacheHit: false,
    };
  }

  async executeStream(options: PipelineOptions): Promise<Observable<any>> {
    const { userId, promptKey, userMessage, conversationId, additionalContext } = options;
    const startTime = Date.now();
    let convoId = conversationId;

    // Resolve or create conversation
    if (promptKey === 'diet-coach' && !convoId) {
      const title = userMessage.length > 30 ? `${userMessage.slice(0, 28)}...` : userMessage;
      const convo = await this.prisma.conversation.create({
        data: { userId, title },
      });
      convoId = convo.id;
    }

    // Save user message to database
    if (convoId) {
      await this.prisma.conversationMessage.create({
        data: {
          conversationId: convoId,
          role: 'user',
          content: userMessage,
          tokens: Math.ceil(userMessage.length / 4),
        },
      });
    }

    // Fetch context using cache
    const store = getRequestContext();
    let ragContext = '';
    const ragCacheKey = `rag-${userId}-${userMessage}`;
    if (store && store.cacheMap.has(ragCacheKey)) {
      ragContext = store.cacheMap.get(ragCacheKey);
    } else {
      ragContext = await this.retrievalService.assembleContext(userId, userMessage);
      if (store) store.cacheMap.set(ragCacheKey, ragContext);
    }

    let memoryContext = '';
    const memoryCacheKey = `mem-${userId}`;
    let memories = [];
    if (store && store.cacheMap.has(memoryCacheKey)) {
      memories = store.cacheMap.get(memoryCacheKey);
    } else {
      memories = await this.memoryService.getMemories(userId);
      if (store) store.cacheMap.set(memoryCacheKey, memories);
    }
    const activeMemories = memories.filter((m: any) => !m.isIgnored);
    if (activeMemories.length > 0) {
      memoryContext = `=== USER LONG-TERM MEMORIES ===\n${activeMemories.map((m: any) => `- ${m.content}`).join('\n')}`;
    }

    const activePrompt = await this.promptRegistry.getActivePrompt(promptKey);
    const systemPrompt = activePrompt.systemPrompt;
    const developerInstructions = activePrompt.developerPrompt || this.promptBuilder.getDeveloperInstructions();

    let historyContext = '';
    if (convoId) {
      const compressedHistory = await this.compressConversationHistory(convoId);
      historyContext = `=== CONVERSATION HISTORY ===\n${compressedHistory}`;
    }

    const fullContextStr = [
      ragContext,
      memoryContext,
      additionalContext,
      historyContext,
    ].filter(Boolean).join('\n\n');

    const prompt = this.promptBuilder.build({
      systemPrompt,
      developerInstructions,
      contextStr: fullContextStr,
      userQuestion: userMessage,
    });

    let accumulatedText = '';
    const providerName = await this.providerOrchestrator.getActiveProviderName();

    return this.providerOrchestrator.generateStream(prompt, systemPrompt, {
      model: activePrompt.model,
      temperature: activePrompt.temperature,
      maxTokens: activePrompt.maxTokens,
    }).pipe(
      map(chunk => {
        accumulatedText += chunk;
        return { data: { token: chunk, conversationId: convoId } };
      }),
      finalize(async () => {
        try {
          const latency = Date.now() - startTime;
          const formatted = this.responseGuard.validateAndClean(accumulatedText);
          
          if (convoId) {
            // Save assistant message to database
            await this.prisma.conversationMessage.create({
              data: {
                conversationId: convoId,
                role: 'assistant',
                content: formatted.answer,
                metadata: JSON.stringify(formatted),
                tokens: Math.ceil(accumulatedText.length / 4),
              },
            });
            await this.prisma.conversation.update({
              where: { id: convoId },
              data: { updatedAt: new Date() },
            });
          }

          // Cache the response
          const profileModel = await this.prisma.userProfile.findUnique({ where: { userId } });
          const profileVersion = profileModel ? profileModel.version : 1;
          
          await this.cacheService.cacheResponse({
            prompt,
            profileVersion,
            engineVersion: '1.0.0',
            provider: providerName,
            promptVersion: activePrompt.version || 1,
          }, accumulatedText);

          // Update context
          if (store) {
            store.cacheHit = false;
            store.aiProvider = providerName;
            store.aiTokens = Math.ceil((prompt.length + accumulatedText.length) / 4);
            store.aiLatency = latency;
          }

          // Log invocation explicitly for streams
          const promptTokens = Math.ceil(prompt.length / 4);
          const completionTokens = Math.ceil(accumulatedText.length / 4);
          const estimatedCost = (promptTokens * 0.00000015) + (completionTokens * 0.0000006);
          
          await this.prisma.aIInvocation.create({
            data: {
              userId,
              provider: providerName,
              model: activePrompt.model || 'stream-model',
              promptTokens,
              completionTokens,
              totalTokens: promptTokens + completionTokens,
              estimatedCost,
              latencyMs: latency,
              cacheHit: false,
              promptVersion: String(activePrompt.version),
            },
          });

          // Auto-evolve long-term memory
          this.memoryService.autoEvolveMemory(userId, userMessage).catch(() => {});
        } catch (e) {
          this.logger.error(`Failed to save streamed response to database: ${e.message}`);
        }
      })
    ) as any;
  }

  async getTokenUsage() {
    const stats = await this.prisma.aIInvocation.aggregate({
      _sum: {
        totalTokens: true,
        promptTokens: true,
        completionTokens: true,
      },
      _count: {
        id: true,
      },
    });

    const groupings = await this.prisma.aIInvocation.groupBy({
      by: ['provider'],
      _sum: {
        totalTokens: true,
      },
    });

    const providerUsage: Record<string, number> = {};
    for (const group of groupings) {
      providerUsage[group.provider] = group._sum.totalTokens || 0;
    }

    return {
      totalTokens: stats._sum.totalTokens || 0,
      promptTokens: stats._sum.promptTokens || 0,
      completionTokens: stats._sum.completionTokens || 0,
      invocationsCount: stats._count.id || 0,
      providerUsage,
    };
  }

  async getCost() {
    const stats = await this.prisma.aIInvocation.aggregate({
      _sum: {
        estimatedCost: true,
      },
    });

    const groupings = await this.prisma.aIInvocation.groupBy({
      by: ['provider'],
      _sum: {
        estimatedCost: true,
      },
    });

    const providerCosts: Record<string, number> = {};
    for (const group of groupings) {
      providerCosts[group.provider] = group._sum.estimatedCost || 0.0;
    }

    return {
      totalCost: stats._sum.estimatedCost || 0.0,
      currency: 'USD',
      providerCosts,
    };
  }

  async getCacheStats() {
    return this.cacheService.getCacheStats();
  }

  async clearCache() {
    return this.cacheService.clearCache();
  }

  async debugRag(userId: string, query: string) {
    const retrievedChunks = await this.retrievalService.retrieveRelevantContext(userId, query);
    return retrievedChunks.map(c => ({
      source: c.source,
      content: c.content,
      score: (c as any).score || 1.0,
    }));
  }

  async getActiveProviderName() {
    return this.providerOrchestrator.getActiveProviderName();
  }
}
export default AIPipelineService;

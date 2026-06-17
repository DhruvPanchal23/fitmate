import { Test, TestingModule } from '@nestjs/testing';
import { AIPipelineService } from './ai-pipeline.service';
import { PromptRegistryService } from '../prompt/prompt-registry.service';
import { RetrievalService } from '../rag/retrieval.service';
import { MemoryService } from '../memory/memory.service';
import { AIProviderOrchestrator } from './ai-provider-orchestrator.service';
import { AIResponseCacheService } from '../cache/ai-response-cache.service';
import { ResponseGuardService } from '../guard/response-guard.service';
import { PromptBuilder } from '../prompt/prompt-builder.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AIPipelineService', () => {
  let service: AIPipelineService;
  let promptRegistry: jest.Mocked<PromptRegistryService>;
  let retrievalService: jest.Mocked<RetrievalService>;
  let memoryService: jest.Mocked<MemoryService>;
  let providerOrchestrator: jest.Mocked<AIProviderOrchestrator>;
  let cacheService: jest.Mocked<AIResponseCacheService>;
  let responseGuard: jest.Mocked<ResponseGuardService>;
  let promptBuilder: jest.Mocked<PromptBuilder>;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPromptRegistry = {
      getActivePrompt: jest.fn(),
    };
    const mockRetrievalService = {
      assembleContext: jest.fn(),
    };
    const mockMemoryService = {
      getMemories: jest.fn(),
      autoEvolveMemory: jest.fn().mockResolvedValue(undefined),
    };
    const mockProviderOrchestrator = {
      generateResponse: jest.fn(),
      generateStream: jest.fn(),
      getActiveProviderName: jest.fn(),
    };
    const mockCacheService = {
      getCachedResponse: jest.fn(),
      cacheResponse: jest.fn(),
    };
    const mockResponseGuard = {
      validateAndClean: jest.fn(),
    };
    const mockPromptBuilder = {
      build: jest.fn(),
      getDeveloperInstructions: jest.fn(),
    };
    const mockPrisma = {
      userProfile: { findUnique: jest.fn() },
      aIInvocation: { create: jest.fn(), aggregate: jest.fn() },
      conversationMessage: { findMany: jest.fn(), create: jest.fn() },
      conversation: { update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIPipelineService,
        { provide: PromptRegistryService, useValue: mockPromptRegistry },
        { provide: RetrievalService, useValue: mockRetrievalService },
        { provide: MemoryService, useValue: mockMemoryService },
        { provide: AIProviderOrchestrator, useValue: mockProviderOrchestrator },
        { provide: AIResponseCacheService, useValue: mockCacheService },
        { provide: ResponseGuardService, useValue: mockResponseGuard },
        { provide: PromptBuilder, useValue: mockPromptBuilder },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AIPipelineService>(AIPipelineService);
    promptRegistry = module.get(PromptRegistryService);
    retrievalService = module.get(RetrievalService);
    memoryService = module.get(MemoryService);
    providerOrchestrator = module.get(AIProviderOrchestrator);
    cacheService = module.get(AIResponseCacheService);
    responseGuard = module.get(ResponseGuardService);
    promptBuilder = module.get(PromptBuilder);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute cache-hit', () => {
    it('should return cached response if hit', async () => {
      retrievalService.assembleContext.mockResolvedValue('RAG context');
      memoryService.getMemories.mockResolvedValue([]);
      promptRegistry.getActivePrompt.mockResolvedValue({
        systemPrompt: 'System',
        model: 'model-1',
        version: 1,
      } as any);
      promptBuilder.build.mockReturnValue('Compiled prompt');
      (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue({ version: 2 });
      providerOrchestrator.getActiveProviderName.mockResolvedValue('provider-1');
      cacheService.getCachedResponse.mockResolvedValue('Cached text answer');
      responseGuard.validateAndClean.mockReturnValue({ answer: 'Cleaned answer', suggestedFoods: [], suggestedMeals: [] } as any);

      const result = await service.execute({
        userId: 'user-1',
        promptKey: 'key',
        userMessage: 'question',
        skipCache: false,
      });

      expect(result.text).toBe('Cached text answer');
      expect(result.cacheHit).toBe(true);
      expect(cacheService.getCachedResponse).toHaveBeenCalled();
      expect(providerOrchestrator.generateResponse).not.toHaveBeenCalled();
    });
  });

  describe('execute cache-miss', () => {
    it('should call orchestrator and cache response on miss', async () => {
      retrievalService.assembleContext.mockResolvedValue('RAG context');
      memoryService.getMemories.mockResolvedValue([]);
      promptRegistry.getActivePrompt.mockResolvedValue({
        systemPrompt: 'System',
        model: 'model-1',
        version: 1,
      } as any);
      promptBuilder.build.mockReturnValue('Compiled prompt');
      (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue({ version: 2 });
      providerOrchestrator.getActiveProviderName.mockResolvedValue('provider-1');
      cacheService.getCachedResponse.mockResolvedValue(null);
      providerOrchestrator.generateResponse.mockResolvedValue({
        text: 'Generated response',
        usage: { promptTokens: 10, completionTokens: 20 },
      });
      responseGuard.validateAndClean.mockReturnValue({ answer: 'Cleaned generated answer', suggestedFoods: [], suggestedMeals: [] } as any);

      const result = await service.execute({
        userId: 'user-1',
        promptKey: 'key',
        userMessage: 'question',
        skipCache: false,
      });

      expect(result.text).toBe('Generated response');
      expect(result.cacheHit).toBe(false);
      expect(providerOrchestrator.generateResponse).toHaveBeenCalled();
      expect(cacheService.cacheResponse).toHaveBeenCalledWith(expect.any(Object), 'Generated response');
    });
  });
});

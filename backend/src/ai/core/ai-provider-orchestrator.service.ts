import { Injectable, Logger } from '@nestjs/common';
import { AIProvider, AIProviderResponse } from './ai-provider.interface';
import { GeminiProvider } from './gemini-provider';
import { OpenAIProvider } from './openai-provider';
import { AnthropicProvider } from './anthropic-provider';
import { MockProvider } from './mock-provider';
import { PrismaService } from '../../prisma/prisma.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AIProviderOrchestrator implements AIProvider {
  private readonly logger = new Logger(AIProviderOrchestrator.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiProvider,
    private readonly openai: OpenAIProvider,
    private readonly anthropic: AnthropicProvider,
    private readonly mock: MockProvider
  ) {}

  // Implements AIProvider generateResponse
  async generateResponse(
    prompt: string,
    systemPrompt?: string,
    options?: { temperature?: number; maxTokens?: number; model?: string }
  ): Promise<AIProviderResponse> {
    const startTime = Date.now();
    const activeProvider = await this.getActiveProviderName();
    
    // Resolve fallback chain starting from active provider
    const chain = this.getFallbackChain(activeProvider);
    let lastError: Error | null = null;

    for (const providerKey of chain) {
      try {
        const provider = this.getProvider(providerKey);
        const resolvedModel = options?.model || this.getDefaultModelForProvider(providerKey);
        
        // Execute request
        const res = await provider.generateResponse(prompt, systemPrompt, {
          ...options,
          model: resolvedModel,
        });

        const latencyMs = Date.now() - startTime;
        const estimatedCost = this.calculateCost(providerKey, resolvedModel, res.usage.promptTokens, res.usage.completionTokens);

        // Persist invocation log
        await this.logInvocation({
          provider: providerKey,
          model: resolvedModel,
          promptTokens: res.usage.promptTokens,
          completionTokens: res.usage.completionTokens,
          totalTokens: res.usage.promptTokens + res.usage.completionTokens,
          estimatedCost,
          latencyMs,
          cacheHit: false,
        });

        return res;
      } catch (err: any) {
        this.logger.warn(`AI Provider '${providerKey}' failed: ${err.message}. Cascading down fallback chain...`);
        lastError = err;
      }
    }

    throw new Error(`All configured AI providers failed. Last error: ${lastError?.message}`);
  }

  generateStream(
    prompt: string,
    systemPrompt?: string,
    options?: { temperature?: number; maxTokens?: number; model?: string }
  ): Observable<string> {
    // For streaming, resolve provider dynamically. If it fails, fallback immediately.
    // In RxJS, catchError lets us intercept stream errors and return a fallback stream.
    const activeProviderPromise = this.getActiveProviderName();
    
    return new Observable<string>((subscriber) => {
      activeProviderPromise.then((activeProvider) => {
        const chain = this.getFallbackChain(activeProvider);
        let currentChainIndex = 0;

        const attemptStream = (providerKey: string) => {
          const provider = this.getProvider(providerKey);
          const resolvedModel = options?.model || this.getDefaultModelForProvider(providerKey);
          
          this.logger.log(`Initiating stream with AI Provider: ${providerKey}`);
          
          provider.generateStream(prompt, systemPrompt, {
            ...options,
            model: resolvedModel,
          }).pipe(
            catchError((err) => {
              this.logger.warn(`Stream failure on '${providerKey}': ${err.message}. Retrying fallback...`);
              currentChainIndex++;
              if (currentChainIndex < chain.length) {
                attemptStream(chain[currentChainIndex]);
                return new Observable<string>(); // swallow error to continue chain
              }
              return throwError(() => err);
            })
          ).subscribe({
            next: (val) => subscriber.next(val),
            error: (err) => subscriber.error(err),
            complete: () => {
              // Log dynamic token usage estimation for streaming
              const latencyMs = 1500; // placeholder for stream duration
              const estimatedCost = this.calculateCost(providerKey, resolvedModel, 300, 400);
              this.logInvocation({
                provider: providerKey,
                model: resolvedModel,
                promptTokens: 300,
                completionTokens: 400,
                totalTokens: 700,
                estimatedCost,
                latencyMs,
                cacheHit: false,
              }).catch(() => {});
              
              subscriber.complete();
            }
          });
        };

        attemptStream(chain[0]);
      }).catch((err) => subscriber.error(err));
    });
  }

  async getActiveProviderName(): Promise<string> {
    try {
      const config = await this.prisma.remoteConfig.findUnique({
        where: { key: 'ACTIVE_AI_PROVIDER' },
      });
      return config ? config.value.toLowerCase() : 'gemini';
    } catch {
      return 'gemini';
    }
  }

  async setActiveProvider(providerName: string): Promise<void> {
    const key = 'ACTIVE_AI_PROVIDER';
    await this.prisma.remoteConfig.upsert({
      where: { key },
      update: { value: providerName.toLowerCase() },
      create: { key, value: providerName.toLowerCase(), description: 'Active LLM API provider key selection' },
    });
  }

  private getProvider(name: string): AIProvider {
    switch (name.toLowerCase()) {
      case 'gemini':
        return this.gemini;
      case 'openai':
        return this.openai;
      case 'anthropic':
        return this.anthropic;
      case 'mock':
      default:
        return this.mock;
    }
  }

  private getFallbackChain(startProvider: string): string[] {
    const standardChain = ['gemini', 'openai', 'anthropic', 'mock'];
    const index = standardChain.indexOf(startProvider.toLowerCase());
    
    if (index === -1) {
      return [startProvider, ...standardChain];
    }
    
    // Slice and append fallbacks
    return [...standardChain.slice(index), ...standardChain.slice(0, index)].filter((val, idx, self) => self.indexOf(val) === idx);
  }

  private getDefaultModelForProvider(provider: string): string {
    switch (provider.toLowerCase()) {
      case 'gemini':
        return 'gemini-2.5-flash';
      case 'openai':
        return 'gpt-4o-mini';
      case 'anthropic':
        return 'claude-3-5-sonnet-latest';
      case 'mock':
      default:
        return 'mock-model';
    }
  }

  private calculateCost(provider: string, model: string, inputTokens: number, outputTokens: number): number {
    let costPerInput = 0;
    let costPerOutput = 0;

    switch (provider.toLowerCase()) {
      case 'gemini':
        costPerInput = 0.075 / 1000000;
        costPerOutput = 0.30 / 1000000;
        break;
      case 'openai':
        costPerInput = 0.15 / 1000000;
        costPerOutput = 0.60 / 1000000;
        break;
      case 'anthropic':
        costPerInput = 3.00 / 1000000;
        costPerOutput = 15.00 / 1000000;
        break;
      default:
        costPerInput = 0.0;
        costPerOutput = 0.0;
    }

    return (inputTokens * costPerInput) + (outputTokens * costPerOutput);
  }

  private async logInvocation(data: {
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
    latencyMs: number;
    cacheHit: boolean;
  }): Promise<void> {
    try {
      await this.prisma.aIInvocation.create({
        data: {
          provider: data.provider,
          model: data.model,
          promptTokens: data.promptTokens,
          completionTokens: data.completionTokens,
          totalTokens: data.totalTokens,
          estimatedCost: data.estimatedCost,
          latencyMs: data.latencyMs,
          cacheHit: data.cacheHit,
        },
      });
    } catch (err: any) {
      this.logger.error(`Failed to log AI Invocation usage snapshot: ${err.message}`);
    }
  }
}
export default AIProviderOrchestrator;

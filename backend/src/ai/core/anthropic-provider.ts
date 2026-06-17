import { Injectable, Logger } from '@nestjs/common';
import { AIProvider, AIProviderResponse } from './ai-provider.interface';
import axios from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class AnthropicProvider implements AIProvider {
  private readonly logger = new Logger(AnthropicProvider.name);
  private readonly defaultModel = 'claude-3-5-sonnet-latest';

  private getApiKey(): string {
    return process.env.ANTHROPIC_API_KEY || '';
  }

  async generateResponse(
    prompt: string,
    systemPrompt?: string,
    options?: { temperature?: number; maxTokens?: number; model?: string }
  ): Promise<AIProviderResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Anthropic API key is not configured');
    }

    const model = options?.model || this.defaultModel;
    const url = 'https://api.anthropic.com/v1/messages';

    const payload: any = {
      model,
      max_tokens: options?.maxTokens ?? 2048,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature ?? 0.2,
    };

    if (systemPrompt) {
      payload.system = systemPrompt;
    }

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    });

    const content = response.data?.content?.[0];
    const text = content?.text || '';
    
    const usage = response.data?.usage || {};
    
    return {
      text,
      usage: {
        promptTokens: usage.input_tokens ?? Math.round(prompt.length / 4),
        completionTokens: usage.output_tokens ?? Math.round(text.length / 4),
      },
    };
  }

  generateStream(
    prompt: string,
    systemPrompt?: string,
    options?: { temperature?: number; maxTokens?: number; model?: string }
  ): Observable<string> {
    return new Observable<string>((subscriber) => {
      const apiKey = this.getApiKey();
      if (!apiKey) {
        subscriber.error(new Error('Anthropic API key is not configured'));
        return;
      }

      const model = options?.model || this.defaultModel;
      const url = 'https://api.anthropic.com/v1/messages';

      const payload: any = {
        model,
        max_tokens: options?.maxTokens ?? 2048,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.2,
        stream: true,
      };

      if (systemPrompt) {
        payload.system = systemPrompt;
      }

      axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        responseType: 'stream',
      })
        .then((response) => {
          const stream = response.data;
          let buffer = '';

          stream.on('data', (chunk: Buffer) => {
            buffer += chunk.toString('utf8');
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const cleaned = line.trim();
              if (cleaned.startsWith('data: ')) {
                const jsonStr = cleaned.slice(6);
                
                try {
                  const eventData = JSON.parse(jsonStr);
                  // Anthropic emits content block delta events
                  if (eventData?.type === 'content_block_delta') {
                    const textChunk = eventData?.delta?.text || '';
                    if (textChunk) {
                      subscriber.next(textChunk);
                    }
                  }
                } catch {}
              }
            }
          });

          stream.on('end', () => {
            subscriber.complete();
          });

          stream.on('error', (err: any) => {
            subscriber.error(err);
          });
        })
        .catch((err) => {
          subscriber.error(err);
        });
    });
  }
}
export default AnthropicProvider;

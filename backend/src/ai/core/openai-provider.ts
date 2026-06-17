import { Injectable, Logger } from '@nestjs/common';
import { AIProvider, AIProviderResponse } from './ai-provider.interface';
import axios from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class OpenAIProvider implements AIProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private readonly defaultModel = 'gpt-4o-mini';

  private getApiKey(): string {
    return process.env.OPENAI_API_KEY || '';
  }

  async generateResponse(
    prompt: string,
    systemPrompt?: string,
    options?: { temperature?: number; maxTokens?: number; model?: string }
  ): Promise<AIProviderResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const model = options?.model || this.defaultModel;
    const url = 'https://api.openai.com/v1/chat/completions';

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const payload: any = {
      model,
      messages,
      temperature: options?.temperature ?? 0.2,
      max_tokens: options?.maxTokens ?? 2048,
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const choice = response.data?.choices?.[0];
    const text = choice?.message?.content || '';
    
    const usage = response.data?.usage || {};
    
    return {
      text,
      usage: {
        promptTokens: usage.prompt_tokens ?? Math.round(prompt.length / 4),
        completionTokens: usage.completion_tokens ?? Math.round(text.length / 4),
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
        subscriber.error(new Error('OpenAI API key is not configured'));
        return;
      }

      const model = options?.model || this.defaultModel;
      const url = 'https://api.openai.com/v1/chat/completions';

      const messages = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const payload = {
        model,
        messages,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.maxTokens ?? 2048,
        stream: true,
      };

      axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
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
                if (jsonStr === '[DONE]') continue;
                
                try {
                  const data = JSON.parse(jsonStr);
                  const content = data?.choices?.[0]?.delta?.content || '';
                  if (content) {
                    subscriber.next(content);
                  }
                } catch {}
              }
            }
          });

          stream.on('end', () => {
            if (buffer.trim().startsWith('data: ')) {
              try {
                const data = JSON.parse(buffer.trim().slice(6));
                const content = data?.choices?.[0]?.delta?.content || '';
                if (content) subscriber.next(content);
              } catch {}
            }
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
export default OpenAIProvider;

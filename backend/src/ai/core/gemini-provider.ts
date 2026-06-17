import { Injectable, Logger } from '@nestjs/common';
import { AIProvider, AIProviderResponse } from './ai-provider.interface';
import axios from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class GeminiProvider implements AIProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly defaultModel = 'gemini-2.5-flash';

  private getApiKey(): string {
    return process.env.GEMINI_API_KEY || '';
  }

  async generateResponse(
    prompt: string,
    systemPrompt?: string,
    options?: { temperature?: number; maxTokens?: number; model?: string }
  ): Promise<AIProviderResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const model = options?.model || this.defaultModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: options?.temperature ?? 0.2,
        maxOutputTokens: options?.maxTokens ?? 2048,
      },
    };

    if (systemPrompt) {
      payload.systemInstruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    const response = await axios.post(url, payload);
    const candidate = response.data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || '';
    
    const usage = response.data?.usageMetadata || {};
    
    return {
      text,
      usage: {
        promptTokens: usage.promptTokenCount ?? Math.round(prompt.length / 4),
        completionTokens: usage.candidatesTokenCount ?? Math.round(text.length / 4),
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
        subscriber.error(new Error('Gemini API key is not configured'));
        return;
      }

      const model = options?.model || this.defaultModel;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

      const payload: any = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: options?.temperature ?? 0.2,
          maxOutputTokens: options?.maxTokens ?? 2048,
        },
      };

      if (systemPrompt) {
        payload.systemInstruction = {
          parts: [{ text: systemPrompt }],
        };
      }

      axios.post(url, payload, { responseType: 'stream' })
        .then((response) => {
          const stream = response.data;
          let buffer = '';

          stream.on('data', (chunk: Buffer) => {
            buffer += chunk.toString('utf8');
            const lines = buffer.split('\n');
            
            // Keep the last partial line in the buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
              const cleaned = line.trim();
              if (cleaned.startsWith('data: ')) {
                try {
                  const jsonStr = cleaned.slice(6);
                  if (jsonStr === '[DONE]') continue;
                  
                  const data = JSON.parse(jsonStr);
                  const contentText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                  if (contentText) {
                    subscriber.next(contentText);
                  }
                } catch (err) {
                  // Ignore parse errors on half-received lines
                }
              }
            }
          });

          stream.on('end', () => {
            if (buffer.trim().startsWith('data: ')) {
              try {
                const data = JSON.parse(buffer.trim().slice(6));
                const contentText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                if (contentText) subscriber.next(contentText);
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
export default GeminiProvider;

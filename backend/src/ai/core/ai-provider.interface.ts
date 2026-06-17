import { Observable } from 'rxjs';

export interface AIProviderResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface AIProvider {
  generateResponse(
    prompt: string,
    systemPrompt?: string,
    options?: { temperature?: number; maxTokens?: number; model?: string }
  ): Promise<AIProviderResponse>;

  generateStream(
    prompt: string,
    systemPrompt?: string,
    options?: { temperature?: number; maxTokens?: number; model?: string }
  ): Observable<string>;
}

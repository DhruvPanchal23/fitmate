import { LLMProvider } from './llm-provider.interface';
export declare class MockLLMProvider implements LLMProvider {
    generateResponse(prompt: string): Promise<string>;
}
export default MockLLMProvider;

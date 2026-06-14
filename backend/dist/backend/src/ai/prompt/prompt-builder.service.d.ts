export interface PromptInput {
    systemPrompt: string;
    developerInstructions: string;
    contextStr: string;
    userQuestion: string;
}
export declare class PromptBuilder {
    private readonly promptSectionsTemplate;
    build(input: PromptInput): string;
    getSystemPrompt(): string;
    getDeveloperInstructions(): string;
    formatContext(context: any): string;
}
export default PromptBuilder;

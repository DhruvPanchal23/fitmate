import { Controller, Post, Get, Body, Param, UseGuards, Request, HttpStatus, HttpCode, Delete, Patch, Query, Sse } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AIOrchestratorService } from '../orchestrator/ai-orchestrator.service';
import { AICoachService } from '../coach/ai-coach.service';
import { AIPipelineService } from '../core/ai-pipeline.service';
import { MemoryService } from '../memory/memory.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Observable } from 'rxjs';
import {
  ConfirmScanRequest,
  RetryScanRequest,
  ChatRequest,
  RegenerateRequest,
  UpdateTitleRequest,
  FeedbackRequest,
} from '../../../../shared/contracts';

@ApiTags('AI Coach & Recognition')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AIController {
  constructor(
    private readonly orchestrator: AIOrchestratorService,
    private readonly coach: AICoachService,
    private readonly pipeline: AIPipelineService,
    private readonly memoryService: MemoryService,
  ) {}

  // --- Image Recognition Scan Endpoints ---

  @Post('scan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze a meal image using AI recognition' })
  @ApiResponse({ status: 200, description: 'Image analyzed, draft matches returned.' })
  async scanImage(@Request() req: any, @Body() body: { imageUrl: string }) {
    return this.orchestrator.scanImage(req.user.id, body.imageUrl);
  }

  @Get('scan/:id')
  @ApiOperation({ summary: 'Retrieve specific meal scan result details' })
  @ApiResponse({ status: 200, description: 'Scan details returned.' })
  async getScan(@Param('id') id: string) {
    return this.orchestrator.getScan(id);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm scanned items and log them as a meal' })
  @ApiResponse({ status: 200, description: 'Meal successfully logged.' })
  async confirmScan(@Request() req: any, @Body() dto: ConfirmScanRequest) {
    return this.orchestrator.confirmScan(req.user.id, dto);
  }

  @Post('retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry AI image recognition scan' })
  @ApiResponse({ status: 200, description: 'Draft matches regenerated.' })
  async retryScan(@Request() req: any, @Body() dto: RetryScanRequest) {
    return this.orchestrator.retryScan(req.user.id, dto.scanId);
  }

  // --- AI Diet Coach Endpoints ---

  @Get('conversations')
  @ApiOperation({ summary: 'Get list of diet coach conversations' })
  @ApiResponse({ status: 200, description: 'Conversations list returned.' })
  async getConversations(@Request() req: any) {
    return this.coach.getConversations(req.user.id);
  }

  @Get('conversation/:id')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  @ApiResponse({ status: 200, description: 'Conversation details returned.' })
  async getConversation(@Param('id') id: string) {
    return this.coach.getConversation(id);
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a message to the AI Diet Coach' })
  @ApiResponse({ status: 200, description: 'Reply returned.' })
  async chat(@Request() req: any, @Body() body: ChatRequest) {
    return this.coach.chat(req.user.id, body.conversationId, body.message);
  }

  @Post('suggestions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get suggested prompt quick actions' })
  @ApiResponse({ status: 200, description: 'Suggested questions returned.' })
  async getSuggestions(@Request() req: any) {
    return this.coach.getSuggestions(req.user.id);
  }

  @Patch('conversation/:id/title')
  @ApiOperation({ summary: 'Update conversation title' })
  @ApiResponse({ status: 200, description: 'Conversation title updated.' })
  async updateTitle(@Param('id') id: string, @Body() body: UpdateTitleRequest) {
    return this.coach.updateTitle(id, body.title);
  }

  @Delete('conversation/:id')
  @ApiOperation({ summary: 'Delete a conversation history' })
  @ApiResponse({ status: 200, description: 'Conversation deleted.' })
  async deleteConversation(@Param('id') id: string) {
    return this.coach.deleteConversation(id);
  }

  @Post('regenerate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Regenerate the last assistant response' })
  @ApiResponse({ status: 200, description: 'Regenerated reply returned.' })
  async regenerate(@Request() req: any, @Body() body: RegenerateRequest) {
    return this.coach.regenerate(req.user.id, body.conversationId);
  }

  @Post('feedback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit rating feedback for an AI response' })
  @ApiResponse({ status: 200, description: 'Feedback successfully saved.' })
  async submitFeedback(@Request() req: any, @Body() body: FeedbackRequest) {
    return this.coach.submitFeedback(req.user.id, body.messageId, body.rating, body.comment);
  }

  // --- SSE Streaming Chat Endpoint ---

  @Sse('chat/stream')
  @ApiOperation({ summary: 'Stream assistant tokens progressively' })
  async chatStream(
    @Request() req: any,
    @Query('message') message: string,
    @Query('conversationId') conversationId?: string
  ): Promise<Observable<any>> {
    return this.pipeline.executeStream({
      userId: req.user.id,
      promptKey: 'diet-coach',
      userMessage: message,
      conversationId,
    });
  }

  // --- Semantic Memory Endpoints ---

  @Get('memories')
  @ApiOperation({ summary: 'Get all user long-term memories' })
  async getMemories(@Request() req: any) {
    return this.memoryService.getMemories(req.user.id);
  }

  @Delete('memories')
  @ApiOperation({ summary: 'Clear all user memories' })
  async clearMemories(@Request() req: any, @Body() body: { sure?: boolean }) {
    if (body.sure) {
      await this.memoryService.clearUserMemory(req.user.id);
    }
    return { success: true };
  }

  @Patch('memory/:id')
  @ApiOperation({ summary: 'Update long-term memory pin or ignore status' })
  async updateMemoryStatus(@Param('id') id: string, @Body() body: { isPinned?: boolean; isIgnored?: boolean }) {
    return this.memoryService.updateMemoryStatus(id, body);
  }

  // --- Token and Cost Analytics ---

  @Get('token-usage')
  @ApiOperation({ summary: 'Get detailed prompt and completion token metrics' })
  async getTokenUsage() {
    return this.pipeline.getTokenUsage();
  }

  @Get('cost')
  @ApiOperation({ summary: 'Get total and provider-specific estimated costs' })
  async getCost() {
    return this.pipeline.getCost();
  }

  @Get('cache')
  @ApiOperation({ summary: 'Get statistics on semantic cache hits' })
  async getCacheStats() {
    return this.pipeline.getCacheStats();
  }

  @Delete('cache')
  @ApiOperation({ summary: 'Clear all semantic cache entries' })
  async clearCache() {
    await this.pipeline.clearCache();
    return { success: true };
  }

  @Get('rag/debug')
  @ApiOperation({ summary: 'Expose RAG engine retrieved chunks and weights' })
  async debugRag(@Query('query') query: string, @Request() req: any) {
    const userId = req.user.id;
    const retrievedChunks = await this.pipeline.debugRag(userId, query);
    return {
      query,
      retrievedChunks,
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check overall AI orchestration health' })
  async getHealth() {
    const activeProvider = await this.pipeline.getActiveProviderName();
    return [
      { name: 'gemini', model: 'gemini-2.5-flash', isActive: activeProvider === 'gemini', isHealthy: true },
      { name: 'openai', model: 'gpt-4o-mini', isActive: activeProvider === 'openai', isHealthy: true },
      { name: 'anthropic', model: 'claude-3-5-sonnet-latest', isActive: activeProvider === 'anthropic', isHealthy: true },
      { name: 'mock', model: 'mock-model', isActive: activeProvider === 'mock', isHealthy: true },
    ];
  }
}
export default AIController;

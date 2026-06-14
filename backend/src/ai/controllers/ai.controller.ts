import { Controller, Post, Get, Body, Param, UseGuards, Request, HttpStatus, HttpCode, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AIOrchestratorService } from '../orchestrator/ai-orchestrator.service';
import { AICoachService } from '../coach/ai-coach.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
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
}
export default AIController;

import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Request, Delete, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SessionService } from './session/session.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user and create their profile' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in an existing user and return tokens' })
  async login(@Request() req: any, @Body() dto: LoginDto) {
    const clientInfo = {
      ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
      deviceInfo: req.headers['user-agent'] || 'Unknown Device',
      fingerprint: req.headers['x-device-fingerprint'] || 'unknown-fingerprint',
    };
    return this.authService.login(dto, clientInfo);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset instructions' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Perform refresh token rotation to get a new access/refresh token pair' })
  async refresh(@Request() req: any, @Body() body: { refreshToken: string }) {
    const clientInfo = {
      ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
      deviceInfo: req.headers['user-agent'] || 'Unknown Device',
      fingerprint: req.headers['x-device-fingerprint'] || 'unknown-fingerprint',
    };
    return this.sessionService.rotateToken(body.refreshToken, clientInfo);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out of the current device session' })
  async logout(@Body() body: { refreshToken: string }) {
    await this.sessionService.revokeSessionByToken(body.refreshToken).catch(() => {});
    return { success: true };
  }

  @Post('logout-all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out of all devices and revoke all active sessions' })
  async logoutAll(@Request() req: any) {
    await this.sessionService.revokeAllSessions(req.user.id);
    return { success: true };
  }

  @Get('sessions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all active user sessions' })
  async getSessions(@Request() req: any) {
    return this.sessionService.getActiveSessions(req.user.id);
  }

  @Delete('sessions/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Revoke and delete a specific device session' })
  async revokeSession(@Param('id') id: string, @Request() req: any) {
    await this.sessionService.revokeSession(id, req.user.id);
    return { success: true };
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile using JWT token' })
  async getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }
}
export default AuthController;

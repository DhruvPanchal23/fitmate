import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UserSessionRepository } from './user-session.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SessionService {
  private readonly MAX_CONCURRENT_SESSIONS = 5;

  constructor(
    private readonly repository: UserSessionRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createSession(
    userId: string,
    email: string,
    refreshToken: string,
    clientInfo: { fingerprint?: string; deviceInfo?: string; ipAddress?: string }
  ) {
    // 1. Enforce concurrent session limits
    const activeSessions = await this.repository.findActiveUserSessions(userId);
    if (activeSessions.length >= this.MAX_CONCURRENT_SESSIONS) {
      // Delete the oldest session
      const oldest = activeSessions[activeSessions.length - 1];
      await this.repository.delete(oldest.id).catch(() => {});
    }

    // Decode token expiry
    const decoded = this.jwtService.decode(refreshToken) as any;
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // 2. Create new session
    return this.repository.create({
      userId,
      refreshToken,
      deviceFingerprint: clientInfo.fingerprint,
      deviceInfo: clientInfo.deviceInfo,
      ipAddress: clientInfo.ipAddress,
      expiresAt,
    });
  }

  async rotateToken(oldRefreshToken: string, clientInfo: { fingerprint?: string; deviceInfo?: string; ipAddress?: string }) {
    // Verify old refresh token signature/expiry
    let payload: any;
    try {
      payload = this.jwtService.verify(oldRefreshToken);
    } catch (err) {
      // If token expired, delete from db and throw
      await this.repository.deleteByRefreshToken(oldRefreshToken).catch(() => {});
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    // Lookup session in DB
    const session = await this.repository.findByRefreshToken(oldRefreshToken);
    if (!session) {
      // SECURITY AUDIT: Token reuse detected! (Token might have been stolen/reused)
      // Revoke all sessions for this user to be safe
      const userId = payload.sub;
      if (userId) {
        await this.repository.deleteAllUserSessions(userId).catch(() => {});
      }
      throw new ForbiddenException('Potential security breach: Refresh token reuse detected');
    }

    // Check session expiry
    if (session.expiresAt < new Date()) {
      await this.repository.delete(session.id).catch(() => {});
      throw new UnauthorizedException('Session expired');
    }

    // Generate new tokens
    const newPayload = { sub: session.userId, email: payload.email };
    const newAccessToken = this.jwtService.sign(newPayload);
    const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '30d' });

    // Rotate token in DB
    const newDecoded = this.jwtService.decode(newRefreshToken) as any;
    const expiresAt = newDecoded?.exp ? new Date(newDecoded.exp * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    await this.repository.updateRefreshToken(session.id, newRefreshToken, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async revokeSession(id: string, userId: string) {
    const active = await this.repository.findActiveUserSessions(userId);
    const hasSession = active.some(s => s.id === id);
    if (!hasSession) {
      throw new UnauthorizedException('Session not found or belongs to another user');
    }
    return this.repository.delete(id);
  }

  async revokeAllSessions(userId: string) {
    return this.repository.deleteAllUserSessions(userId);
  }

  async getActiveSessions(userId: string) {
    const sessions = await this.repository.findActiveUserSessions(userId);
    return sessions.map(s => ({
      id: s.id,
      deviceInfo: s.deviceInfo || 'Unknown Device',
      ipAddress: s.ipAddress || 'Unknown IP',
      lastLoginAt: s.lastLoginAt,
      isCurrent: false, // will be tagged by caller
    }));
  }

  async revokeSessionByToken(refreshToken: string) {
    return this.repository.deleteByRefreshToken(refreshToken);
  }

  async cleanExpired() {
    return this.repository.deleteExpired();
  }
}
export default SessionService;

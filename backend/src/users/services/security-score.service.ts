import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SecurityScoreService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateScore(userId: string): Promise<{
    score: number;
    factors: {
      passwordQuality: 'good' | 'fair' | 'poor';
      twoFactorReady: boolean;
      sessionCount: number;
      lastLoginDaysAgo: number;
      deviceTrust: 'trusted' | 'unknown';
      profileCompleteness: number; // percentage
    };
  }> {
    let score = 30; // base score

    // 1. Password Quality check (Bcrypt hash exists is baseline good)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const passwordQuality = user?.passwordHash ? 'good' : 'poor';
    if (passwordQuality === 'good') score += 10;

    // 2. Profile Completeness (fetch profile and check properties)
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });
    let profileCompleteness = 0;
    if (profile) {
      const fields = ['fullName', 'gender', 'age', 'height', 'weight', 'activityLevel', 'goal'];
      const filled = fields.filter(f => !!(profile as any)[f]).length;
      profileCompleteness = Math.round((filled / fields.length) * 100);
      score += Math.round((profileCompleteness / 100) * 20); // up to 20 points
    }

    // 3. Session count check
    const sessions = await this.prisma.userSession.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
    });
    const sessionCount = sessions.length;
    if (sessionCount === 1) score += 20;
    else if (sessionCount > 1 && sessionCount <= 3) score += 15;
    else if (sessionCount > 3 && sessionCount <= 5) score += 5;

    // 4. Last login check
    let lastLoginDaysAgo = 30;
    if (sessions.length > 0) {
      const mostRecent = Math.max(...sessions.map(s => s.lastLoginAt.getTime()));
      lastLoginDaysAgo = Math.round((Date.now() - mostRecent) / (1000 * 60 * 60 * 24));
      if (lastLoginDaysAgo <= 1) score += 15;
      else if (lastLoginDaysAgo <= 7) score += 10;
      else if (lastLoginDaysAgo <= 14) score += 5;
    }

    // 5. Device trust check
    const untrusted = sessions.some(s => !s.deviceFingerprint || s.deviceFingerprint === 'unknown-fingerprint');
    const deviceTrust = (sessions.length > 0 && !untrusted) ? 'trusted' : 'unknown';
    if (deviceTrust === 'trusted') score += 15;

    // 6. 2FA readiness (mocking false as no schema column currently supports it)
    const twoFactorReady = false;

    // Cap score at 100 and min at 0
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      factors: {
        passwordQuality,
        twoFactorReady,
        sessionCount,
        lastLoginDaysAgo,
        deviceTrust,
        profileCompleteness,
      },
    };
  }
}
export default SecurityScoreService;

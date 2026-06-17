import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    refreshToken: string;
    deviceFingerprint?: string;
    deviceInfo?: string;
    ipAddress?: string;
    expiresAt: Date;
  }) {
    return this.prisma.userSession.create({
      data,
    });
  }

  async findByRefreshToken(refreshToken: string) {
    return this.prisma.userSession.findUnique({
      where: { refreshToken },
    });
  }

  async findActiveUserSessions(userId: string) {
    return this.prisma.userSession.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        lastLoginAt: 'desc',
      },
    });
  }

  async delete(id: string) {
    return this.prisma.userSession.delete({
      where: { id },
    });
  }

  async deleteByRefreshToken(refreshToken: string) {
    return this.prisma.userSession.deleteMany({
      where: { refreshToken },
    });
  }

  async deleteAllUserSessions(userId: string) {
    return this.prisma.userSession.deleteMany({
      where: { userId },
    });
  }

  async updateRefreshToken(id: string, newRefreshToken: string, expiresAt: Date) {
    return this.prisma.userSession.update({
      where: { id },
      data: {
        refreshToken: newRefreshToken,
        expiresAt,
        lastLoginAt: new Date(),
      },
    });
  }

  async deleteExpired() {
    return this.prisma.userSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
export default UserSessionRepository;

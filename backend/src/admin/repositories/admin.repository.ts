import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminRepository {
  constructor(public readonly prisma: PrismaService) {}

  // --- Admin User & Auth ---
  async findAdminUserByEmail(email: string) {
    return this.prisma.adminUser.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  async findAdminUserById(id: string) {
    return this.prisma.adminUser.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  async createAdminUser(data: { email: string; passwordHash: string; fullName: string; roleId: string }) {
    return this.prisma.adminUser.create({
      data,
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  // --- Seed RBAC ---
  async seedRBAC() {
    const permissionsList = [
      'users:read', 'users:write', 'users:suspend', 'users:ban',
      'foods:read', 'foods:write', 'foods:approve',
      'prompts:read', 'prompts:write', 'prompts:activate',
      'flags:read', 'flags:write',
      'configs:read', 'configs:write',
      'announcements:read', 'announcements:write',
      'audits:read', 'analytics:read'
    ];

    // Create permissions
    for (const action of permissionsList) {
      await this.prisma.permission.upsert({
        where: { action },
        update: {},
        create: { action },
      });
    }

    // Seed roles
    const rolesMap = {
      'Super Admin': permissionsList,
      'Admin': ['users:read', 'users:write', 'users:suspend', 'foods:read', 'foods:write', 'foods:approve', 'prompts:read', 'flags:read', 'configs:read', 'announcements:read', 'announcements:write', 'audits:read', 'analytics:read'],
      'Moderator': ['users:read', 'users:suspend', 'foods:read', 'foods:approve', 'announcements:read'],
      'Nutrition Expert': ['foods:read', 'foods:write', 'foods:approve'],
      'Content Manager': ['prompts:read', 'prompts:write', 'announcements:read', 'announcements:write'],
      'Support Agent': ['users:read', 'users:suspend', 'foods:read']
    };

    for (const [roleName, allowedActions] of Object.entries(rolesMap)) {
      const dbPerms = await this.prisma.permission.findMany({
        where: { action: { in: allowedActions } },
      });

      await this.prisma.role.upsert({
        where: { name: roleName },
        update: {
          permissions: {
            set: dbPerms.map(p => ({ id: p.id })),
          },
        },
        create: {
          name: roleName,
          permissions: {
            connect: dbPerms.map(p => ({ id: p.id })),
          },
        },
      });
    }
  }

  // --- Audit Log ---
  async createAuditLog(data: {
    adminUserId?: string;
    action: string;
    target: string;
    beforeValue?: string;
    afterValue?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        adminUserId: data.adminUserId || null,
        action: data.action,
        target: data.target,
        beforeValue: data.beforeValue || null,
        afterValue: data.afterValue || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    });
  }

  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        adminUser: true,
      },
    });
  }

  // --- Feature Flags ---
  async getFeatureFlags() {
    return this.prisma.featureFlag.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async findFeatureFlagByKey(key: string) {
    return this.prisma.featureFlag.findUnique({
      where: { key },
    });
  }

  async createFeatureFlag(data: { key: string; enabled: boolean; description?: string; rules?: string }) {
    return this.prisma.featureFlag.create({
      data,
    });
  }

  async updateFeatureFlag(key: string, data: { enabled?: boolean; description?: string; rules?: string }) {
    return this.prisma.featureFlag.update({
      where: { key },
      data,
    });
  }

  // --- Remote Config ---
  async getRemoteConfigs() {
    return this.prisma.remoteConfig.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async findRemoteConfigByKey(key: string) {
    return this.prisma.remoteConfig.findUnique({
      where: { key },
    });
  }

  async createRemoteConfig(data: { key: string; value: string; description?: string }) {
    return this.prisma.remoteConfig.create({
      data,
    });
  }

  async updateRemoteConfig(key: string, data: { value?: string; description?: string }) {
    return this.prisma.remoteConfig.update({
      where: { key },
      data,
    });
  }

  // --- System Announcements ---
  async getAnnouncements() {
    return this.prisma.systemAnnouncement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAnnouncement(data: {
    title: string;
    body: string;
    targetGroup: string;
    scheduledFor?: Date;
    expiresAt?: Date;
  }) {
    return this.prisma.systemAnnouncement.create({
      data,
    });
  }

  // --- Prompt Templates & CMS ---
  async getPrompts() {
    return this.prisma.promptTemplate.findMany({
      orderBy: { key: 'asc' },
      include: {
        versions: {
          orderBy: { version: 'desc' },
        },
      },
    });
  }

  async findPromptByKey(key: string) {
    return this.prisma.promptTemplate.findUnique({
      where: { key },
      include: {
        versions: {
          orderBy: { version: 'desc' },
        },
      },
    });
  }

  async createPromptTemplate(key: string, description?: string) {
    return this.prisma.promptTemplate.create({
      data: { key, description },
    });
  }

  async addPromptVersion(promptTemplateId: string, content: string, versionNumber: number, createdBy: string) {
    return this.prisma.contentVersion.create({
      data: {
        promptTemplateId,
        content,
        version: versionNumber,
        createdBy,
        isActive: false,
      },
    });
  }

  async activatePromptVersion(promptTemplateId: string, versionId: string) {
    // Set all other versions to inactive
    await this.prisma.contentVersion.updateMany({
      where: { promptTemplateId },
      data: { isActive: false },
    });

    // Set target version to active
    const activeVersion = await this.prisma.contentVersion.update({
      where: { id: versionId },
      data: { isActive: true },
    });

    // Update active version link on prompt template
    return this.prisma.promptTemplate.update({
      where: { id: promptTemplateId },
      data: { activeId: versionId },
      include: {
        versions: true,
      },
    });
  }

  // --- User Management ---
  async searchUsers(query: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { profile: { fullName: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        profile: true,
      },
      take: 50,
    });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async updateUserStatus(id: string, status: { isSuspended?: boolean; isBanned?: boolean }) {
    return this.prisma.user.update({
      where: { id },
      data: status,
      include: { profile: true },
    });
  }

  async resetUserProfile(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    if (profile) {
      return this.prisma.userProfile.update({
        where: { id: profile.id },
        data: {
          height: 170,
          weight: 70,
          targetWeight: 70,
          bodyFatPercentage: null,
          activityLevel: 'sedentary',
          goal: 'maintenance',
          dietPreference: null,
          allergies: [],
          dislikedFoods: [],
          preferredFoods: [],
          workoutDays: 3,
          sleepHours: 7,
          wakeUpTime: '07:00',
          version: profile.version + 1,
          updatedBy: 'SYSTEM',
        },
      });
    }
    throw new Error('Profile not found to reset');
  }

  // --- Food Catalog CMS ---
  async searchFoods(query: string) {
    return this.prisma.food.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      take: 100,
    });
  }

  async findFoodById(id: string) {
    return this.prisma.food.findUnique({
      where: { id },
    });
  }

  async createFood(data: {
    name: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
    fiber: number;
    sugar: number;
    defaultUnit?: string;
    servingSize?: number;
    source?: any;
  }) {
    return this.prisma.food.create({
      data,
    });
  }

  async updateFood(
    id: string,
    data: {
      name?: string;
      calories?: number;
      protein?: number;
      carbohydrates?: number;
      fats?: number;
      fiber?: number;
      sugar?: number;
      defaultUnit?: string;
      servingSize?: number;
      source?: any;
    }
  ) {
    return this.prisma.food.update({
      where: { id },
      data,
    });
  }

  async deleteFood(id: string) {
    return this.prisma.food.delete({
      where: { id },
    });
  }

  async getMetrics() {
    const [
      totalUsers,
      activeUsers,
      mealsLogged,
      aiChats,
      scans,
      travelSessions,
      notificationsSent,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isSuspended: false, isBanned: false } }),
      this.prisma.meal.count(),
      this.prisma.conversationMessage.count(),
      this.prisma.mealScan.count(),
      this.prisma.travelSession.count(),
      this.prisma.notification.count(),
    ]);

    // Average health score
    const healthScores = await this.prisma.healthScoreHistory.aggregate({
      _avg: { score: true },
    });

    return {
      totalUsers,
      activeUsers,
      newRegistrations: totalUsers, // emulate
      mealsLogged,
      aiChats,
      scans,
      travelSessions,
      notificationsSent,
      healthScoreAverage: Math.round(healthScores._avg.score || 75),
      systemStatus: 'healthy' as const,
    };
  }
}
export default AdminRepository;

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminRepository } from './repositories/admin.repository';
import { UserManagementService } from './services/user-management.service';
import { FoodManagementService } from './services/food-management.service';
import { PromptManagementService } from './services/prompt-management.service';
import { NotificationManagementService } from './services/notification-management.service';
import { FeatureFlagService } from './services/feature-flag.service';
import { RemoteConfigService } from './services/remote-config.service';
import { AuditService } from './services/audit.service';
import { AnalyticsManagementService } from './services/analytics-management.service';
import { AdminRbacGuard } from './guards/admin-rbac.guard';

import { HealthModule } from '../health/health.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') || configService.get<string>('JWT_SECRET') || 'fitmate-secret-key-change-in-production-12345',
        signOptions: {
          expiresIn: (configService.get<string>('jwt.expiresIn') || configService.get<string>('JWT_EXPIRES_IN') || '7d') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminRepository,
    UserManagementService,
    FoodManagementService,
    PromptManagementService,
    NotificationManagementService,
    FeatureFlagService,
    RemoteConfigService,
    AuditService,
    AnalyticsManagementService,
    AdminRbacGuard,
  ],
  exports: [
    AdminService,
    AdminRepository,
    UserManagementService,
    FoodManagementService,
    PromptManagementService,
    NotificationManagementService,
    FeatureFlagService,
    RemoteConfigService,
    AuditService,
    AnalyticsManagementService,
  ],
})
export class AdminModule {}
export default AdminModule;

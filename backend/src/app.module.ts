import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { MealsModule } from './meals/meals.module';
import { WaterModule } from './water/water.module';
import { SupplementsModule } from './supplements/supplements.module';
import { ExerciseModule } from './exercise/exercise.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { AiModule } from './ai/ai.module';
import { TravelModule } from './travel/travel.module';
import { MealPlannerModule } from './meal-planner/meal-planner.module';
import { ProfileModule } from './profile/profile.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { CommonModule } from './common/common.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    HealthModule,
    MealsModule,
    WaterModule,
    SupplementsModule,
    ExerciseModule,
    NutritionModule,
    AiModule,
    TravelModule,
    MealPlannerModule,
    ProfileModule,
    AnalyticsModule,
    NotificationsModule,
    AdminModule,
    CommonModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}

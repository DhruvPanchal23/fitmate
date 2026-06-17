import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityScoreService } from './services/security-score.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, SecurityScoreService],
  exports: [UsersService, SecurityScoreService],
})
export class UsersModule {}

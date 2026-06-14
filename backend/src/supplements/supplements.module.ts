import { Module } from '@nestjs/common';
import { SupplementsService } from './supplements.service';
import { SupplementsController } from './supplements.controller';
import { SupplementsRepository } from './supplements.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SupplementsController],
  providers: [SupplementsService, SupplementsRepository],
  exports: [SupplementsService, SupplementsRepository],
})
export class SupplementsModule {}

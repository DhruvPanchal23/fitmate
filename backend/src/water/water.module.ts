import { Module } from '@nestjs/common';
import { WaterService } from './water.service';
import { WaterController } from './water.controller';
import { WaterRepository } from './water.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WaterController],
  providers: [WaterService, WaterRepository],
  exports: [WaterService, WaterRepository],
})
export class WaterModule {}

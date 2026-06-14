import { Module } from '@nestjs/common';
import { TravelController } from './travel.controller';
import { TravelService } from './travel.service';
import { TravelRepository } from './travel.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TravelController],
  providers: [TravelService, TravelRepository],
  exports: [TravelService, TravelRepository],
})
export class TravelModule {}
export default TravelModule;

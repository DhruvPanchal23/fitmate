import { Injectable, Inject } from '@nestjs/common';
import { VisionProvider } from './vision-provider.interface';
import { VisionRawResponse } from '../../../../shared/contracts';

@Injectable()
export class VisionService {
  constructor(
    @Inject('VisionProvider') private readonly provider: VisionProvider,
  ) {}

  async analyze(imageUrl: string): Promise<VisionRawResponse> {
    return this.provider.analyzeImage(imageUrl);
  }
}

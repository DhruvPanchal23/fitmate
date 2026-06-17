import { Injectable } from '@nestjs/common';
import { CreateBodyMeasurementRequest } from '../../../../shared/contracts/profile';

export interface MeasurementProvider {
  name: string;
  process(userId: string, data: CreateBodyMeasurementRequest): Promise<CreateBodyMeasurementRequest>;
}

@Injectable()
export class ManualMeasurementProvider implements MeasurementProvider {
  readonly name = 'MANUAL';

  async process(userId: string, data: CreateBodyMeasurementRequest): Promise<CreateBodyMeasurementRequest> {
    // Manual measurements are recorded as-is without external transformation
    return {
      ...data,
      source: data.source || 'USER',
    };
  }
}

@Injectable()
export class FutureAppleHealthProvider implements MeasurementProvider {
  readonly name = 'APPLE_HEALTH';

  async process(userId: string, data: CreateBodyMeasurementRequest): Promise<CreateBodyMeasurementRequest> {
    // Future Apple Health sync mapping logic
    return {
      ...data,
      source: 'APPLE_HEALTH',
    };
  }
}

@Injectable()
export class FutureGoogleFitProvider implements MeasurementProvider {
  readonly name = 'GOOGLE_FIT';

  async process(userId: string, data: CreateBodyMeasurementRequest): Promise<CreateBodyMeasurementRequest> {
    // Future Google Fit sync mapping logic
    return {
      ...data,
      source: 'GOOGLE_FIT',
    };
  }
}

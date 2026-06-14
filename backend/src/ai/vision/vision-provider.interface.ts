import { VisionRawResponse } from '../../../../shared/contracts';

export interface VisionProvider {
  analyzeImage(imageUrl: string): Promise<VisionRawResponse>;
}

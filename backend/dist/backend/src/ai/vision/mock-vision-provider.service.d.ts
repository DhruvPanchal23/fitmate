import { VisionProvider } from './vision-provider.interface';
import { VisionRawResponse } from '../../../../shared/contracts';
export declare class MockVisionProvider implements VisionProvider {
    analyzeImage(imageUrl: string): Promise<VisionRawResponse>;
}

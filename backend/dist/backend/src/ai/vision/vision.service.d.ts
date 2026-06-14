import { VisionProvider } from './vision-provider.interface';
import { VisionRawResponse } from '../../../../shared/contracts';
export declare class VisionService {
    private readonly provider;
    constructor(provider: VisionProvider);
    analyze(imageUrl: string): Promise<VisionRawResponse>;
}

import { LoggerService } from '@nestjs/common';
export declare class CustomLogger implements LoggerService {
    private logger;
    constructor();
    private getContextMeta;
    log(message: any, ...optionalParams: any[]): void;
    error(message: any, ...optionalParams: any[]): void;
    warn(message: any, ...optionalParams: any[]): void;
    debug(message: any, ...optionalParams: any[]): void;
    verbose(message: any, ...optionalParams: any[]): void;
}
export declare const logger: CustomLogger;

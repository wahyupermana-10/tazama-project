import type { ILoggerService } from '../interfaces';
import type { IRelay } from '../interfaces/iRelayService';
export declare class GoogleRelay implements IRelay {
    private logger?;
    private client?;
    private readonly config;
    init(loggerService?: ILoggerService): void;
    relay(data: Uint8Array): Promise<void>;
}

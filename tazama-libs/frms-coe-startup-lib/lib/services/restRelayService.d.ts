import type { IRelay } from '../interfaces/iRelayService';
import type { ILoggerService } from '../interfaces';
export declare class RestRelay implements IRelay {
    private readonly config;
    private httpAgent?;
    private httpsAgent?;
    private logger?;
    private jsonPayload?;
    init(loggerService?: ILoggerService): Promise<void>;
    relay(data: Uint8Array): Promise<void>;
}

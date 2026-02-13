import type { IRelay } from '../interfaces/iRelayService';
import type { ILoggerService } from '../interfaces';
export declare class NatsRelay implements IRelay {
    private readonly config;
    private NatsConn_Producer?;
    private logger?;
    init(loggerService?: ILoggerService): Promise<void>;
    relay(data: Uint8Array): Promise<void>;
}

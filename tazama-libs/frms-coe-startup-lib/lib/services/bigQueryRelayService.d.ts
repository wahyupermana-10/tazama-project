import type { ILoggerService } from '../interfaces';
import type { IRelay } from '../interfaces/iRelayService';
export declare class BigQueryRelay implements IRelay {
    private logger?;
    private bigquery?;
    private readonly config;
    init(loggerService?: ILoggerService): void;
    relay(data: Uint8Array): Promise<void>;
}

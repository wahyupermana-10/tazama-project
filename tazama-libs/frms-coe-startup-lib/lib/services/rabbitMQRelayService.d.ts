import type { IRelay } from '../interfaces/iRelayService';
import type { ProcessorConfig } from '@tazama-lf/frms-coe-lib/lib/config/processor.config';
import type { ILoggerService } from '../interfaces';
export declare class RabbitRelay implements IRelay {
    private readonly config;
    private RabbitConn?;
    private RabbitChannel?;
    private logger?;
    private queue?;
    init(config: ProcessorConfig, loggerService?: ILoggerService): Promise<void>;
    relay(data: Uint8Array): Promise<void>;
}

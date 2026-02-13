import type { IStartupService, onMessageFunction } from '..';
import type { ILoggerService } from '../interfaces';
export declare class StartupFactory implements IStartupService {
    startupService: IStartupService;
    /**
     *  Initializes a new startup service which would either be a Jetstream or Nats server, depending on the configurd SERVER_TYPE env variable ('nats' | 'jestream')
     */
    constructor();
    init(onMessage: onMessageFunction, loggerService?: ILoggerService, parConsumerStreamNames?: string[], parProducerStreamName?: string): Promise<boolean>;
    initProducer(loggerService?: ILoggerService, parProducerStreamName?: string): Promise<boolean>;
    handleResponse(response: object, subject?: string[]): Promise<void>;
}

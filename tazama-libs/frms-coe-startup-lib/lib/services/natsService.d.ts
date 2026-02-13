import { type NatsConnection, type Subscription } from 'nats';
import type { ILoggerService } from '../interfaces';
import type { onMessageFunction } from '../types/onMessageFunction';
import type { IStartupService } from '..';
export declare class NatsService implements IStartupService {
    server: {
        servers: string;
    };
    producerStreamName: string;
    consumerStreamName: string[] | undefined;
    functionName: string;
    NatsConn?: NatsConnection;
    logger?: ILoggerService | Console;
    /**
     * Initialize Nats consumer, supplying a callback function to call every time a new message comes in.
     *
     * @export
     * @param {Function} onMessage Method to be called every time there's a new message. Will be called with two parameters:
     * A json object with the message as parameter;
     * A handleResponse method that should be called when the function is done processing, giving the response object as parameter.
     *
     * The Following environmental variables is required for this function to work:
     * NODE_ENV=debug
     * SERVER_URL=0.0.0.0:4222 <- Nats Server URL
     * FUNCTION_NAME=function_name <- Function Name is used to determine streams.
     *
     * @return {*}  {Promise<boolean>}
     */
    init(onMessage: onMessageFunction, loggerService?: ILoggerService, parConsumerStreamNames?: string[], parProducerStreamName?: string): Promise<boolean>;
    subscribe(subscription: Subscription, onMessage: onMessageFunction): Promise<void>;
    /**
     * Initialize Nats Producer
     *
     * @export
     * @param {Function} loggerService
     *
     * Method to init Producer Stream. This function will not react to incomming NATS messages.
     * The Following environmental variables is required for this function to work:
     * NODE_ENV=debug
     * SERVER_URL=0.0.0.0:4222 - Nats Server URL
     * FUNCTION_NAME=function_name - Function Name is used to determine streams.
     * PRODUCER_STREAM - Stream name for the producer Stream
     *
     * @return {*}  {Promise<boolean>}
     */
    initProducer(loggerService?: ILoggerService, parProducerStreamName?: string): Promise<boolean>;
    validateEnvironment(parProducerStreamName?: string): void;
    /**
     * Handle the response once the function executed by onMessage is complete. Publish it to the Producer Stream
     *
     * @export
     * @param {string} response Response string to be send to the producer stream.
     *
     * @return {*}  {Promise<void>}
     */
    handleResponse(response: object, subject?: string[]): Promise<void>;
}

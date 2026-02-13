export interface IRelayConfig {
    destinationType: 'nats' | 'rabbitmq' | 'rest';
    destinationUrl: string;
    producerStream: string;
    bucketName?: string;
    googleApplicationCredentials?: string;
    tableId?: string;
    datasetId?: string;
}
export declare const relayConfig: IRelayConfig;

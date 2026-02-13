export interface IStartupConfig {
    /**
     *Configure the service type that should be started up, eg, Nats = 'nats' or Jetstream = 'jetstream'
     *
     * @type {('nats' | 'jetstream')}
     * @memberof IStartupConfig
     */
    startupType: 'nats' | 'jetstream';
    ackPolicy: 'None' | 'All' | 'Explicit' | 'NotSet';
    /**
     *Could be either "Memory" or "File"
     *
     * @type {string}
     * @memberof IStartupConfig
     */
    producerStorage: string;
    producerStreamName: string;
    /**
     *Could be "Workqueue", "Interest" or "Limits"
     *
     * @type {string}
     * @memberof IStartupConfig
     */
    producerRetentionPolicy: string;
    consumerStreamName: string;
    /**
     *parseInt(process.env.ITERATIONS!, 10) || 1000
     *
     * @type {string}
     * @memberof IStartupConfig
     */
    serverUrl: string;
    /**
     *env: <string>process.env.NODE_ENV
     *
     * @type {string}
     * @memberof IStartupConfig
     * @requires
     */
    env: string;
    /**
     *functionName: <string>process.env.FUNCTION_NAME
     *
     * @type {string}
     * @memberof IStartupConfig
     */
    functionName: string;
    /**
     *functionName: <string>process.env.STREAM_SUBJECT
     *
     * @type {string}
     * @memberof IStartupConfig
     */
    streamSubject: string;
}
export declare const startupConfig: IStartupConfig;

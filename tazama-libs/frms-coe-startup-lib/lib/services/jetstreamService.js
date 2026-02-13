"use strict";
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
exports.JetstreamService = void 0;
const nats_1 = require("nats");
const promises_1 = require("node:timers/promises");
const iStartupConfig_1 = require("../interfaces/iStartupConfig");
const utils_1 = require("../utils");
class JetstreamService {
    server = {
        servers: iStartupConfig_1.startupConfig.serverUrl,
    };
    producerStreamName = '';
    consumerStreamName = '';
    functionName = '';
    NatsConn;
    jsm;
    js;
    logger;
    onMessage;
    /**
     * Initialize JetStream consumer, supplying a callback function to call every time a new message comes in.
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
    async init(onMessage, loggerService) {
        try {
            // Validate additional Environmental Variables.
            if (!iStartupConfig_1.startupConfig.consumerStreamName) {
                throw new Error('No Consumer Stream Name Provided in environmental Variable');
            }
            this.onMessage = onMessage;
            await this.initProducer(loggerService);
            // Guard statement to ensure initProducer was successful
            if (!this.NatsConn || !this.jsm || !this.js || !this.logger)
                return await Promise.resolve(false);
            // Add consumer streams
            this.consumerStreamName = iStartupConfig_1.startupConfig.consumerStreamName; // "RuleRequest";
            await this.createConsumer(this.functionName, this.jsm, this.consumerStreamName);
            if (this.consumerStreamName)
                await this.consume(this.js, onMessage, this.consumerStreamName, this.functionName);
        }
        catch (err) {
            let error;
            let errorMessage = '';
            if (err instanceof Error) {
                error = err;
                errorMessage = error.message;
            }
            else {
                const strErr = JSON.stringify(err);
                errorMessage = strErr;
                error = new Error(errorMessage);
            }
            this.logger?.log(`Error communicating with NATS on: ${JSON.stringify(this.server)}, with error: ${errorMessage}`);
            throw error;
        }
        return await Promise.resolve(true);
    }
    /**
     * Initialize JetStream Producer Stream
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
    async initProducer(loggerService) {
        await this.validateEnvironment();
        this.logger = (0, utils_1.getLogger)(iStartupConfig_1.startupConfig, loggerService);
        try {
            // Connect to NATS Server
            this.logger.log(`Attempting connection to NATS, with config:\n${JSON.stringify(iStartupConfig_1.startupConfig)}`);
            this.NatsConn = await (0, nats_1.connect)(this.server);
            this.logger.log(`Connected to ${this.NatsConn.getServer()}`);
            this.functionName = iStartupConfig_1.startupConfig.functionName.replace(/\./g, '_');
            // Jetstream setup
            this.jsm = await this.NatsConn.jetstreamManager();
            this.js = this.NatsConn.jetstream();
            // Add producer streams
            this.producerStreamName = iStartupConfig_1.startupConfig.producerStreamName; // `RuleResponse${functionName}`;
            await this.createStream(this.jsm, this.producerStreamName);
        }
        catch (err) {
            let error;
            let errorMessage = '';
            if (err instanceof Error) {
                error = err;
                errorMessage = error.message;
            }
            else {
                const strErr = JSON.stringify(err);
                errorMessage = strErr;
                error = new Error(errorMessage);
            }
            this.logger.log(`Error communicating with NATS on: ${JSON.stringify(this.server)}, with error: ${errorMessage}`);
            throw error;
        }
        this.NatsConn.closed().then(async () => {
            this.logger.log('Connection Lost to NATS Server, Reconnecting...');
            let connected = false;
            while (!connected) {
                this.logger.log('Attempting to recconect to NATS...');
                connected = await this.connectNats();
                if (!connected) {
                    this.logger.warn('Unable to connect, retrying....');
                    // await new Promise((resolve) => setTimeout(resolve, 5000));
                    await (0, promises_1.setTimeout)(5000);
                }
                else {
                    this.logger.log('Reconnected to nats');
                    break;
                }
            }
        });
        return await Promise.resolve(true);
    }
    async validateEnvironment() {
        if (!iStartupConfig_1.startupConfig.producerStreamName) {
            throw new Error('No Producer Stream Name Provided in environmental Variable');
        }
        if (!iStartupConfig_1.startupConfig.serverUrl) {
            throw new Error('No Server URL was Provided in environmental Variable');
        }
        if (!iStartupConfig_1.startupConfig.functionName) {
            throw new Error('No Function Name was Provided in environmental Variable');
        }
        await Promise.resolve(undefined);
    }
    async connectNats() {
        try {
            this.NatsConn = await (0, nats_1.connect)(this.server);
            this.jsm = await this.NatsConn.jetstreamManager();
            this.js = this.NatsConn.jetstream();
            if (this.consumerStreamName && this.onMessage) {
                await this.createConsumer(this.functionName, this.jsm, this.consumerStreamName);
                await this.consume(this.js, this.onMessage, this.consumerStreamName, this.functionName);
            }
        }
        catch (error) {
            this.logger?.log(`Failed to connect to NATS.\n${JSON.stringify(error)}`);
            return false;
        }
        return true;
    }
    async createConsumer(functionName, jsm, consumerStreamName) {
        const consumerStreams = consumerStreamName.split(',');
        for (const stream of consumerStreams) {
            await this.createStream(jsm, stream, iStartupConfig_1.startupConfig.streamSubject ? iStartupConfig_1.startupConfig.streamSubject : undefined);
            // Require Nats Version 2.10 to be released. Slated for a few months.
            // const streamSubjects = startupConfig.streamSubject ? startupConfig.streamSubject.split(',') : [startupConfig.consumerStreamName];
            const typedAckPolicy = iStartupConfig_1.startupConfig.ackPolicy;
            const consumerCfg = {
                ack_policy: nats_1.AckPolicy[typedAckPolicy],
                durable_name: functionName,
                // filter_subjects: streamSubjects, Require Nats Version 2.10 to be released. Slated for a few months.
            };
            await jsm.consumers.add(stream, consumerCfg);
            this.logger?.log('Connected Consumer to Consumer Stream');
        }
        await Promise.resolve(undefined);
    }
    async createStream(jsm, streamName, subjectName) {
        await jsm.streams.find(streamName).then(async (stream) => {
            this.logger?.log(`Stream: ${streamName} already exists.`);
            if (subjectName) {
                const subjectList = subjectName.split(',');
                this.logger?.log(`Adding subject(s): ${subjectName} to stream: ${streamName}`);
                const streamInfo = await jsm.streams.info(stream);
                for (const subject of subjectList) {
                    if (streamInfo.config.subjects.includes(subject)) {
                        this.logger?.log(`Subject: ${subject} Already present`);
                        continue;
                    }
                    if (streamInfo.config.subjects)
                        streamInfo.config.subjects.push(subject);
                    else
                        streamInfo.config.subjects = [subject];
                    this.logger?.log(`Subject: ${subject} Added.`);
                }
                await jsm.streams.update(streamName, streamInfo.config);
            }
        }, async (reason) => {
            const typedRetentionPolicy = iStartupConfig_1.startupConfig.producerRetentionPolicy;
            const typedStorgage = iStartupConfig_1.startupConfig.producerStorage;
            const cfg = {
                name: streamName,
                subjects: subjectName ? subjectName.split(',') : [streamName],
                retention: nats_1.RetentionPolicy[typedRetentionPolicy],
                storage: nats_1.StorageType[typedStorgage],
            };
            await jsm.streams.add(cfg);
            this.logger?.log(`Created stream: ${streamName}`);
        });
    }
    /**
     * Handle the response once the function executed by onMessage is complete. Publish it to the Producer Stream
     *
     * @export
     * @param {string} response Response string to be send to the producer stream.
     *
     * @return {*}  {Promise<void>}
     */
    async handleResponse(response, subject) {
        const sc = (0, nats_1.StringCodec)();
        const publishes = [];
        const res = JSON.stringify(response);
        if (this.js && this.producerStreamName) {
            if (!subject) {
                publishes.push(this.js.publish(this.producerStreamName, sc.encode(res)));
            }
            else {
                for (const sub of subject) {
                    publishes.push(this.js.publish(sub, sc.encode(res)));
                }
            }
            await Promise.all(publishes);
        }
        await Promise.resolve();
    }
    async consume(js, onMessage, consumerStreamName, functionName) {
        // Get the consumer to listen to messages for
        const consumer = await js.consumers.get(consumerStreamName, functionName);
        // create a simple consumer and iterate over messages matching the subscription
        const sub = await consumer.consume({ max_messages: 1 });
        for await (const message of sub) {
            this.logger?.log(`${Date.now().toLocaleString()} S:[${message.seq}] Q:[${message.subject}]: ${message.data.length}`);
            const request = message.json();
            try {
                onMessage(request, (msg) => {
                    void this.handleResponse(msg);
                });
            }
            catch (error) {
                this.logger?.error(`Error while handling message: \r\n${error}`);
            }
            message.ack();
        }
    }
}
exports.JetstreamService = JetstreamService;
//# sourceMappingURL=jetstreamService.js.map
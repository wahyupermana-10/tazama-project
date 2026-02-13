"use strict";
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartupFactory = void 0;
const iStartupConfig_1 = require("../interfaces/iStartupConfig");
const jetstreamService_1 = require("./jetstreamService");
const natsService_1 = require("./natsService");
class StartupFactory {
    startupService;
    /**
     *  Initializes a new startup service which would either be a Jetstream or Nats server, depending on the configurd SERVER_TYPE env variable ('nats' | 'jestream')
     */
    constructor() {
        switch (iStartupConfig_1.startupConfig.startupType) {
            case 'jetstream':
                this.startupService = new jetstreamService_1.JetstreamService();
                break;
            case 'nats':
                this.startupService = new natsService_1.NatsService();
                break;
        }
    }
    async init(onMessage, loggerService, parConsumerStreamNames, parProducerStreamName) {
        process.on('uncaughtException', () => {
            this.startupService.init(onMessage, loggerService, parConsumerStreamNames, parProducerStreamName);
        });
        process.on('unhandledRejection', () => {
            this.startupService.init(onMessage, loggerService, parConsumerStreamNames, parProducerStreamName);
        });
        return await this.startupService.init(onMessage, loggerService, parConsumerStreamNames, parProducerStreamName);
    }
    async initProducer(loggerService, parProducerStreamName) {
        process.on('uncaughtException', () => {
            this.startupService.initProducer(loggerService, parProducerStreamName);
        });
        process.on('unhandledRejection', () => {
            this.startupService.initProducer(loggerService, parProducerStreamName);
        });
        return await this.startupService.initProducer(loggerService, parProducerStreamName);
    }
    async handleResponse(response, subject) {
        await this.startupService.handleResponse(response, subject);
    }
}
exports.StartupFactory = StartupFactory;
//# sourceMappingURL=startupFactory.js.map
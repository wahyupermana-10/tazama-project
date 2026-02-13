"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitRelay = void 0;
const tslib_1 = require("tslib");
const amqplib_1 = tslib_1.__importDefault(require("amqplib"));
const iRelayConfig_1 = require("../interfaces/iRelayConfig");
const iStartupConfig_1 = require("../interfaces/iStartupConfig");
const config_1 = require("@tazama-lf/frms-coe-lib/lib/config");
const utils_1 = require("../utils");
class RabbitRelay {
    config = iRelayConfig_1.relayConfig;
    RabbitConn;
    RabbitChannel;
    logger;
    queue;
    async init(config, loggerService) {
        this.queue = (0, config_1.validateEnvVar)('QUEUE', 'string').toString();
        this.logger = (0, utils_1.getLogger)(iStartupConfig_1.startupConfig, loggerService);
        this.RabbitConn = await amqplib_1.default.connect(this.config.destinationUrl);
        this.RabbitChannel = await this.RabbitConn.createChannel();
        this.logger.log('[TRS]: Connected to Client RabbitMQ');
        await this.RabbitChannel.assertQueue(config.functionName, {
            durable: false,
        });
    }
    async relay(data) {
        try {
            this.RabbitChannel?.sendToQueue(this.queue, Buffer.from(data));
            this.logger?.log(`Message relayed to RabbitMQ on ${this.queue}`);
        }
        catch (error) {
            this.logger?.error(`Error relaying to RabbitMQ ${JSON.stringify(error)}`);
        }
    }
}
exports.RabbitRelay = RabbitRelay;
//# sourceMappingURL=rabbitMQRelayService.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NatsRelay = void 0;
const nats_1 = require("nats");
const iRelayConfig_1 = require("../interfaces/iRelayConfig");
const iStartupConfig_1 = require("../interfaces/iStartupConfig");
const utils_1 = require("../utils");
class NatsRelay {
    config = iRelayConfig_1.relayConfig;
    NatsConn_Producer;
    logger;
    async init(loggerService) {
        this.logger = (0, utils_1.getLogger)(iStartupConfig_1.startupConfig, loggerService);
        this.NatsConn_Producer = await (0, nats_1.connect)({
            servers: this.config.destinationUrl,
        });
        this.logger.log(`[TRS]: Connected to Client NATS: ${JSON.stringify(this.NatsConn_Producer.info, null, 4)}`);
    }
    async relay(data) {
        try {
            this.NatsConn_Producer?.publish(iRelayConfig_1.relayConfig.producerStream, data);
        }
        catch (error) {
            this.logger?.error(`[TRS]: Connected to Client NATS: ${JSON.stringify(this.NatsConn_Producer?.info, null, 4)}`);
        }
    }
}
exports.NatsRelay = NatsRelay;
//# sourceMappingURL=natsRelayService.js.map
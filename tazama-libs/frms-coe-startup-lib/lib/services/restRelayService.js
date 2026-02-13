"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestRelay = void 0;
const tslib_1 = require("tslib");
const iRelayConfig_1 = require("../interfaces/iRelayConfig");
const node_http_1 = tslib_1.__importDefault(require("node:http"));
const node_https_1 = tslib_1.__importDefault(require("node:https"));
const protobuf_1 = tslib_1.__importDefault(require("@tazama-lf/frms-coe-lib/lib/helpers/protobuf"));
const axios_1 = tslib_1.__importDefault(require("axios"));
const config_1 = require("@tazama-lf/frms-coe-lib/lib/config");
const iStartupConfig_1 = require("../interfaces/iStartupConfig");
const utils_1 = require("../utils");
class RestRelay {
    config = iRelayConfig_1.relayConfig;
    httpAgent;
    httpsAgent;
    logger;
    jsonPayload;
    async init(loggerService) {
        this.logger = (0, utils_1.getLogger)(iStartupConfig_1.startupConfig, loggerService);
        const sockets = Number((0, config_1.validateEnvVar)('MAX_SOCKETS', 'number'));
        this.jsonPayload = Boolean((0, config_1.validateEnvVar)('JSON_PAYLOAD', 'boolean'));
        this.httpAgent = new node_http_1.default.Agent({ keepAlive: true, maxSockets: Number(sockets) });
        this.httpsAgent = new node_https_1.default.Agent({ keepAlive: true, maxSockets: Number(sockets) });
    }
    async relay(data) {
        try {
            const agent = { httpAgent: this.httpAgent, httpsAgent: this.httpsAgent };
            if (this.jsonPayload) {
                const decodedMessage = protobuf_1.default.decode(data);
                const messageObject = protobuf_1.default.toObject(decodedMessage);
                await axios_1.default.post(this.config.destinationUrl, { messageObject }, agent);
            }
            else {
                await axios_1.default.post(this.config.destinationUrl, { message: data }, agent);
            }
            this.logger?.log('Message relayed to REST API');
        }
        catch (error) {
            this.logger?.error(`Error relaying to REST API ${JSON.stringify(error)}`);
        }
    }
}
exports.RestRelay = RestRelay;
//# sourceMappingURL=restRelayService.js.map
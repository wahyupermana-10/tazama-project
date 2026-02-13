"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleRelay = void 0;
const tslib_1 = require("tslib");
const storage_1 = require("@google-cloud/storage");
const protobuf_1 = tslib_1.__importDefault(require("@tazama-lf/frms-coe-lib/lib/helpers/protobuf"));
const node_crypto_1 = require("node:crypto");
const iRelayConfig_1 = require("../interfaces/iRelayConfig");
const iStartupConfig_1 = require("../interfaces/iStartupConfig");
const utils_1 = require("../utils");
class GoogleRelay {
    logger;
    client;
    config = iRelayConfig_1.relayConfig;
    init(loggerService) {
        this.logger = (0, utils_1.getLogger)(iStartupConfig_1.startupConfig, loggerService);
        this.client = new storage_1.Storage();
    }
    async relay(data) {
        try {
            const decodedMessage = protobuf_1.default.decode(data);
            const messageObject = protobuf_1.default.toObject(decodedMessage);
            const messageString = JSON.stringify(messageObject);
            const bucket = this.client.bucket(this.config.bucketName);
            const file = bucket.file(`reports/${(0, node_crypto_1.randomUUID)()}.json`);
            await file.save(messageString, {
                metadata: { contentType: 'application/json' },
            });
            this.logger?.log('[TRS]: File Successfuly saved to google cloud bucket.');
        }
        catch (error) {
            this.logger?.error(`[TRS]: Error when trying to save file to Google Cloud Bucket. ${JSON.stringify(error)}`);
        }
    }
}
exports.GoogleRelay = GoogleRelay;
//# sourceMappingURL=googleBucketsService.js.map
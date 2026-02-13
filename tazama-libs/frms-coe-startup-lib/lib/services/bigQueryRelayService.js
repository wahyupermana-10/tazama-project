"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigQueryRelay = void 0;
const tslib_1 = require("tslib");
const bigquery_1 = require("@google-cloud/bigquery");
const protobuf_1 = tslib_1.__importDefault(require("@tazama-lf/frms-coe-lib/lib/helpers/protobuf"));
const iRelayConfig_1 = require("../interfaces/iRelayConfig");
const iStartupConfig_1 = require("../interfaces/iStartupConfig");
const utils_1 = require("../utils");
class BigQueryRelay {
    logger;
    bigquery;
    config = iRelayConfig_1.relayConfig;
    init(loggerService) {
        this.bigquery = new bigquery_1.BigQuery();
        this.logger = (0, utils_1.getLogger)(iStartupConfig_1.startupConfig, loggerService);
        if (!this.config.datasetId) {
            this.logger.warn('No Dataset configured.');
        }
        if (!this.config.tableId) {
            this.logger.warn('No Data Table configured.');
        }
    }
    async relay(data) {
        try {
            const decodedMessage = protobuf_1.default.decode(data);
            const messageObject = protobuf_1.default.toObject(decodedMessage);
            messageObject.report.timestamp = new Date().toISOString(); // This is required due to a bug in the proto file, discarding this date.
            await this.bigquery.dataset(this.config.datasetId).table(this.config.tableId).insert(messageObject);
            this.logger?.log('[TRS]: Record inserted into Big Query');
        }
        catch (error) {
            this.logger?.error(`[TRS]: Error when inserting row into Big Query. ${JSON.stringify(error)}`);
        }
    }
}
exports.BigQueryRelay = BigQueryRelay;
//# sourceMappingURL=bigQueryRelayService.js.map
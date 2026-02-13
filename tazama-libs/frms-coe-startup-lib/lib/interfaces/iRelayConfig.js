"use strict";
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
exports.relayConfig = void 0;
const config_1 = require("@tazama-lf/frms-coe-lib/lib/config");
const iStartupConfig_1 = require("./iStartupConfig");
exports.relayConfig = {
    destinationType: (0, config_1.validateEnvVar)('DESTINATION_TYPE', 'string').toString(),
    destinationUrl: (0, config_1.validateEnvVar)('DESTINATION_URL', 'string').toString(),
    producerStream: iStartupConfig_1.startupConfig.producerStreamName,
    bucketName: (0, config_1.validateEnvVar)('GOOGLE_BUCKET_NAME', 'string', true).toString(),
    googleApplicationCredentials: (0, config_1.validateEnvVar)('GOOGLE_APPLICATION_CREDENTIALS', 'string', true).toString(),
    tableId: (0, config_1.validateEnvVar)('TABLE_ID', 'string', true).toString(),
    datasetId: (0, config_1.validateEnvVar)('DATASET_ID', 'string', true).toString(),
};
//# sourceMappingURL=iRelayConfig.js.map
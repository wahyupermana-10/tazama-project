"use strict";
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
exports.startupConfig = void 0;
const tslib_1 = require("tslib");
const dotenv_1 = require("dotenv");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const config_1 = require("@tazama-lf/frms-coe-lib/lib/config");
// Load .env file into process.env if it exists. This is convenient for running locally.
(0, dotenv_1.config)({
    path: node_path_1.default.resolve(__dirname, '../.env'),
});
exports.startupConfig = {
    startupType: (0, config_1.validateEnvVar)('STARTUP_TYPE', 'string').toString(),
    env: (0, config_1.validateEnvVar)('NODE_ENV', 'string').toString(),
    serverUrl: (0, config_1.validateEnvVar)('SERVER_URL', 'string').toString(),
    functionName: (0, config_1.validateEnvVar)('FUNCTION_NAME', 'string').toString(),
    producerStreamName: (0, config_1.validateEnvVar)('PRODUCER_STREAM', 'string', true).toString(),
    consumerStreamName: (0, config_1.validateEnvVar)('CONSUMER_STREAM', 'string', true).toString(),
    streamSubject: (0, config_1.validateEnvVar)('STREAM_SUBJECT', 'string', true).toString(),
    producerRetentionPolicy: process.env.PRODUCER_RETENTION_POLICY || 'Workqueue',
    ackPolicy: process.env.ACK_POLICY || 'Explicit',
    producerStorage: process.env.PRODUCER_STORAGE || 'Memory',
};
//# sourceMappingURL=iStartupConfig.js.map
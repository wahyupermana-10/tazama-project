"use strict";
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationBuilder = evaluationBuilder;
const tslib_1 = require("tslib");
const util = tslib_1.__importStar(require("node:util"));
const pg_1 = require("pg");
const utils_1 = require("../builders/utils");
const dbManager_1 = require("../services/dbManager");
const utils_2 = require("./utils");
async function evaluationBuilder(manager, evaluationConfig) {
    const conf = {
        host: evaluationConfig.host,
        port: evaluationConfig.port,
        database: evaluationConfig.databaseName,
        user: evaluationConfig.user,
        password: evaluationConfig.password,
        ssl: (0, utils_2.getSSLConfig)(evaluationConfig.certPath),
    };
    manager._evaluation = new pg_1.Pool(conf);
    try {
        const dbReady = await (0, utils_1.isDatabaseReady)(manager._evaluation);
        dbManager_1.readyChecks.EvaluationDB = dbReady ? 'Ok' : 'err';
    }
    catch (err) {
        dbManager_1.readyChecks.EvaluationDB = `err, ${util.inspect(err)}`;
    }
    manager.getReportByMessageId = async (messageid, tenantId) => {
        const client = await manager._evaluation.connect();
        try {
            await client.query('BEGIN');
            await client.query('SELECT public.set_tenant_id($1)', [tenantId]);
            const query = {
                text: 'SELECT evaluation FROM evaluation WHERE messageId = $1',
                values: [messageid],
            };
            const queryRes = await client.query(query);
            await client.query('COMMIT');
            const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0].evaluation : undefined;
            return toReturn;
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
    };
    manager.saveEvaluationResult = async (transactionID, transaction, networkMap, alert, dataCache) => {
        const data = {
            transactionID,
            transaction,
            networkMap,
            report: alert,
            dataCache,
        };
        const client = await manager._evaluation.connect();
        try {
            await client.query('BEGIN');
            await client.query('SELECT public.set_tenant_id($1)', [transaction.TenantId]);
            const query = {
                text: 'INSERT INTO evaluation (evaluation) VALUES ($1) ON CONFLICT (messageId, tenantId) DO NOTHING',
                values: [data],
            };
            await client.query(query);
            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
    };
}
//# sourceMappingURL=evaluationBuilder.js.map
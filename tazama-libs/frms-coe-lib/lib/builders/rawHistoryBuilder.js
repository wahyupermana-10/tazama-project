"use strict";
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawHistoryBuilder = rawHistoryBuilder;
const tslib_1 = require("tslib");
const util = tslib_1.__importStar(require("node:util"));
const pg_1 = require("pg");
const utils_1 = require("../builders/utils");
const dbManager_1 = require("../services/dbManager");
const utils_2 = require("./utils");
async function rawHistoryBuilder(manager, rawHistoryConfig) {
    const conf = {
        host: rawHistoryConfig.host,
        port: rawHistoryConfig.port,
        database: rawHistoryConfig.databaseName,
        user: rawHistoryConfig.user,
        password: rawHistoryConfig.password,
        ssl: (0, utils_2.getSSLConfig)(rawHistoryConfig.certPath),
    };
    manager._rawHistory = new pg_1.Pool(conf);
    try {
        const dbReady = await (0, utils_1.isDatabaseReady)(manager._rawHistory);
        dbManager_1.readyChecks.RawHistoryDB = dbReady ? 'Ok' : 'err';
    }
    catch (error) {
        const err = error;
        dbManager_1.readyChecks.RawHistoryDB = `err, ${util.inspect(err)}`;
    }
    manager.getTransactionPacs008 = async (endToEndId, tenantId) => {
        const client = await manager._rawHistory.connect();
        try {
            await client.query('BEGIN');
            await client.query('SELECT public.set_tenant_id($1)', [tenantId]);
            const query = {
                text: 'SELECT document FROM pacs008 WHERE endToEndId = $1',
                values: [endToEndId],
            };
            const queryRes = await client.query(query);
            await client.query('COMMIT');
            const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0].document : undefined;
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
    manager.saveTransactionHistoryPain001 = async (tran) => {
        const client = await manager._rawHistory.connect();
        try {
            await client.query('BEGIN');
            await client.query('SELECT public.set_tenant_id($1)', [tran.TenantId]);
            const query = {
                text: 'INSERT INTO pain001 (document) VALUES ($1) ON CONFLICT (EndToEndId, tenantId) DO NOTHING',
                values: [tran],
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
    manager.saveTransactionHistoryPain013 = async (tran) => {
        const client = await manager._rawHistory.connect();
        try {
            await client.query('BEGIN');
            await client.query('SELECT public.set_tenant_id($1)', [tran.TenantId]);
            const query = {
                text: 'INSERT INTO pain013 (document) VALUES ($1) ON CONFLICT (EndToEndId, tenantId) DO NOTHING',
                values: [tran],
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
    manager.saveTransactionHistoryPacs008 = async (tran) => {
        const client = await manager._rawHistory.connect();
        try {
            await client.query('BEGIN');
            await client.query('SELECT public.set_tenant_id($1)', [tran.TenantId]);
            const query = {
                text: 'INSERT INTO pacs008 (document) VALUES ($1) ON CONFLICT (EndToEndId, tenantId) DO NOTHING',
                values: [tran],
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
    manager.saveTransactionHistoryPacs002 = async (tran) => {
        const client = await manager._rawHistory.connect();
        try {
            await client.query('BEGIN');
            await client.query('SELECT public.set_tenant_id($1)', [tran.TenantId]);
            const query = {
                text: 'INSERT INTO pacs002 (document) VALUES ($1) ON CONFLICT (EndToEndId, tenantId) DO NOTHING',
                values: [tran],
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
//# sourceMappingURL=rawHistoryBuilder.js.map
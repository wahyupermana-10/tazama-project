// SPDX-License-Identifier: Apache-2.0
// Rule 904: Rapid Transaction Detection
// Mendeteksi jika ada lebih dari 1 transaksi dalam 1 menit dari debtor yang sama

import type { DatabaseManagerInstance, LoggerService, ManagerConfig } from '@tazama-lf/frms-coe-lib';
import type { OutcomeResult, RuleConfig, RuleRequest, RuleResult } from '@tazama-lf/frms-coe-lib/lib/interfaces';

export type RuleExecutorConfig = ManagerConfig &
  Required<Pick<ManagerConfig, 'rawHistory' | 'eventHistory' | 'configuration' | 'localCacheConfig'>>;

interface CountRow {
  length: number;
}

export async function handleTransaction(
  req: RuleRequest,
  determineOutcome: (value: number, ruleConfig: RuleConfig, ruleResult: RuleResult) => RuleResult,
  ruleRes: RuleResult,
  loggerService: LoggerService,
  ruleConfig: RuleConfig,
  databaseManager: DatabaseManagerInstance<RuleExecutorConfig>,
): Promise<RuleResult> {
  const context = `Rule-${ruleConfig.id} handleTransaction()`;
  const msgId = req.transaction.FIToFIPmtSts?.GrpHdr?.MsgId || 'unknown';

  loggerService.trace('Start - Rapid Transaction Detection', context, msgId);

  // Validasi config
  if (!ruleConfig.config.bands?.length) {
    throw new Error('Invalid ruleConfig - bands not provided');
  }
  if (!ruleConfig.config.exitConditions) {
    throw new Error('Invalid ruleConfig - exitConditions not provided');
  }
  if (!ruleConfig.config.parameters?.timeWindowMs) {
    throw new Error('Invalid ruleConfig - timeWindowMs not provided');
  }

  // Exit condition: transaksi gagal
  loggerService.trace('Step 1 - Check exit conditions', context, msgId);
  
  const unsuccessfulTx = ruleConfig.config.exitConditions.find(
    (b: OutcomeResult) => b.subRuleRef === '.x00'
  );

  if (req.transaction.FIToFIPmtSts?.TxInfAndSts?.TxSts !== 'ACCC') {
    if (!unsuccessfulTx) throw new Error('No exit condition for unsuccessful transaction');
    return { ...ruleRes, reason: unsuccessfulTx.reason, subRuleRef: unsuccessfulTx.subRuleRef };
  }

  // Step 2: Get debtor account ID
  loggerService.trace('Step 2 - Get debtor account ID', context, msgId);
  
  const debtorAccountId = req.DataCache?.dbtrAcctId;
  if (!debtorAccountId) {
    loggerService.trace('No debtor account ID found, returning .01', context, msgId);
    return determineOutcome(1, ruleConfig, ruleRes);
  }

  // Step 3: Get current timestamp and time window
  loggerService.trace('Step 3 - Setup query parameters', context, msgId);
  
  const currentTimestamp = req.transaction.FIToFIPmtSts?.GrpHdr?.CreDtTm || new Date().toISOString();
  const timeWindowMs: number = Number(ruleConfig.config.parameters.timeWindowMs) || 60000;
  const tenantId = req.transaction.TenantId || 'DEFAULT';

  // Step 4: Query transaksi dari debtor yang sama dalam time window
  // Menggunakan format yang sama seperti Rule 901
  loggerService.trace('Step 4 - Query previous transactions', context, msgId);

  const values = [debtorAccountId, currentTimestamp, timeWindowMs, tenantId];

  // Query: hitung transaksi dari debtor account yang sama dalam time window
  const queryString = `SELECT COUNT(*)::int AS length
FROM transaction tr
WHERE tr.destination = $1
AND tr."txtp" = 'pacs.002.001.12'
AND ($2::timestamptz - tr."credttm"::timestamptz) <= $3 * interval '1 millisecond'
AND tr.tenantId = $4;`;

  let transactionCount = 1; // Default: minimal 1 (transaksi saat ini)

  try {
    const res = await databaseManager._eventHistory.query<CountRow>(queryString, values);
    
    if (res.rows && res.rows.length > 0) {
      const [{ length }] = res.rows;
      transactionCount = typeof length === 'number' ? length : 1;
      loggerService.trace(`Query result: ${transactionCount} transactions found`, context, msgId);
    }
  } catch (error) {
    loggerService.error(`Error querying transactions: ${error}`, context, msgId);
    // Fallback ke 1 jika query gagal
    transactionCount = 1;
  }

  // Log untuk debugging
  loggerService.trace(`Debtor Account: ${debtorAccountId}`, context, msgId);
  loggerService.trace(`Time Window: ${timeWindowMs}ms`, context, msgId);
  loggerService.trace(`Transaction Count: ${transactionCount}`, context, msgId);

  // Step 5: Evaluasi berdasarkan jumlah transaksi
  loggerService.trace('Step 5 - Evaluate transaction count', context, msgId);

  const result = determineOutcome(transactionCount, ruleConfig, ruleRes);
  
  loggerService.trace(`Result: subRuleRef=${result.subRuleRef}, count=${transactionCount}`, context, msgId);
  loggerService.trace('End - Rapid Transaction Detection', context, msgId);

  return result;
}

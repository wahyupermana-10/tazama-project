// SPDX-License-Identifier: Apache-2.0
// Rule 903: Large Transaction Detection
// Mendeteksi transaksi dengan jumlah besar

import type { DatabaseManagerInstance, LoggerService, ManagerConfig } from '@tazama-lf/frms-coe-lib';
import type { OutcomeResult, RuleConfig, RuleRequest, RuleResult } from '@tazama-lf/frms-coe-lib/lib/interfaces';

export type RuleExecutorConfig = ManagerConfig &
  Required<Pick<ManagerConfig, 'rawHistory' | 'eventHistory' | 'configuration' | 'localCacheConfig'>>;

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

  loggerService.trace('Start - handle transaction', context, msgId);

  // Validasi config
  if (!ruleConfig.config.bands?.length) {
    throw new Error('Invalid ruleConfig - bands not provided');
  }
  if (!ruleConfig.config.exitConditions) {
    throw new Error('Invalid ruleConfig - exitConditions not provided');
  }

  // Exit condition: transaksi gagal
  const unsuccessfulTx = ruleConfig.config.exitConditions.find(
    (b: OutcomeResult) => b.subRuleRef === '.x00'
  );

  if (req.transaction.FIToFIPmtSts?.TxInfAndSts?.TxSts !== 'ACCC') {
    if (!unsuccessfulTx) throw new Error('No exit condition for unsuccessful transaction');
    return { ...ruleRes, reason: unsuccessfulTx.reason, subRuleRef: unsuccessfulTx.subRuleRef };
  }

  // Ambil jumlah transaksi dari DataCache
  let amount = 0;
  if (req.DataCache?.amt) {
    amount = Number(req.DataCache.amt);
  }

  loggerService.trace(`Transaction amount: ${amount}`, context, msgId);

  // Evaluasi berdasarkan bands di config
  return determineOutcome(amount, ruleConfig, ruleRes);
}

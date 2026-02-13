// SPDX-License-Identifier: Apache-2.0
// Rule 907: Unusual Time Pattern
// Deteksi transaksi di jam tidak biasa (tengah malam)

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

  loggerService.trace('Start - Unusual Time Pattern Detection', context, msgId);

  // Validate config
  if (!ruleConfig.config.bands?.length) {
    throw new Error('Invalid ruleConfig - bands not provided');
  }
  if (!ruleConfig.config.exitConditions) {
    throw new Error('Invalid ruleConfig - exitConditions not provided');
  }

  // Exit condition: unsuccessful transaction
  const unsuccessfulTx = ruleConfig.config.exitConditions.find(
    (b: OutcomeResult) => b.subRuleRef === '.x00'
  );

  if (req.transaction.FIToFIPmtSts?.TxInfAndSts?.TxSts !== 'ACCC') {
    if (!unsuccessfulTx) throw new Error('No exit condition for unsuccessful transaction');
    return { ...ruleRes, reason: unsuccessfulTx.reason, subRuleRef: unsuccessfulTx.subRuleRef };
  }

  // ============================================
  // CUSTOM LOGIC: Extract hour from timestamp
  // ============================================
  
  // Get timestamp from transaction
  const timestamp = req.transaction.FIToFIPmtSts?.GrpHdr?.CreDtTm;
  
  if (!timestamp) {
    loggerService.trace('No timestamp found, returning .01', context, msgId);
    return determineOutcome(12, ruleConfig, ruleRes); // Default to noon (normal)
  }

  // Parse timestamp and extract hour (0-23)
  const date = new Date(timestamp);
  const hour = date.getUTCHours(); // Use UTC or local based on your needs
  
  loggerService.trace(`Transaction timestamp: ${timestamp}`, context, msgId);
  loggerService.trace(`Extracted hour: ${hour}`, context, msgId);

  // Evaluate hour against bands
  // Bands are configured as:
  // Band 1: 6-22 (normal hours)
  // Band 2: 22-24 (late night)
  // Band 3: 0-2 (midnight)
  // Band 4: 2-6 (very suspicious)
  
  const result = determineOutcome(hour, ruleConfig, ruleRes);
  
  loggerService.trace(`Result: subRuleRef=${result.subRuleRef}, hour=${hour}`, context, msgId);
  loggerService.trace('End - Unusual Time Pattern Detection', context, msgId);

  return result;
}

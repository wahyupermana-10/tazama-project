"use strict";
// SPDX-License-Identifier: Apache-2.0
// Rule 903: Large Transaction Detection
// Mendeteksi transaksi dengan jumlah besar yang mencurigakan
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransaction = handleTransaction;
async function handleTransaction(req, determineOutcome, ruleRes, loggerService, ruleConfig, databaseManager) {
    const context = `Rule-${ruleConfig.id} handleTransaction()`;
    const msgId = req.transaction.FIToFIPmtSts?.GrpHdr?.MsgId || 'unknown';
    loggerService.trace('Start - handle transaction (Large Transaction Detection)', context, msgId);
    // Validasi config
    if (!ruleConfig.config.bands?.length) {
        throw new Error('Invalid ruleConfig - bands not provided');
    }
    if (!ruleConfig.config.exitConditions) {
        throw new Error('Invalid ruleConfig - exitConditions not provided');
    }
    // Exit condition: transaksi gagal
    loggerService.trace('Step 1 - Check exit conditions', context, msgId);
    const unsuccessfulTx = ruleConfig.config.exitConditions.find((b) => b.subRuleRef === '.x00');
    if (req.transaction.FIToFIPmtSts?.TxInfAndSts?.TxSts !== 'ACCC') {
        if (!unsuccessfulTx)
            throw new Error('No exit condition for unsuccessful transaction');
        return { ...ruleRes, reason: unsuccessfulTx.reason, subRuleRef: unsuccessfulTx.subRuleRef };
    }
    // Step 2: Ambil jumlah transaksi dari DataCache
    loggerService.trace('Step 2 - Get transaction amount', context, msgId);
    let amount = 0;
    // Ambil dari instdAmt (instructed amount) atau intrBkSttlmAmt (interbank settlement amount)
    if (req.DataCache?.instdAmt?.amt) {
        amount = req.DataCache.instdAmt.amt;
        loggerService.trace(`Amount from instdAmt: ${amount}`, context, msgId);
    }
    else if (req.DataCache?.intrBkSttlmAmt?.amt) {
        amount = req.DataCache.intrBkSttlmAmt.amt;
        loggerService.trace(`Amount from intrBkSttlmAmt: ${amount}`, context, msgId);
    }
    else {
        loggerService.trace('No amount found in DataCache, using 0', context, msgId);
    }
    // Step 3: Evaluasi berdasarkan bands
    loggerService.trace(`Step 3 - Evaluate amount ${amount} against bands`, context, msgId);
    // determineOutcome akan cocokkan amount dengan bands di config
    const result = determineOutcome(amount, ruleConfig, ruleRes);
    loggerService.trace(`Result: subRuleRef=${result.subRuleRef}`, context, msgId);
    loggerService.trace('End - handle transaction', context, msgId);
    return result;
}
//# sourceMappingURL=rule-903.js.map
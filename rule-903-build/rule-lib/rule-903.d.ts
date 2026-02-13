import type { DatabaseManagerInstance, LoggerService, ManagerConfig } from '@tazama-lf/frms-coe-lib';
import type { RuleConfig, RuleRequest, RuleResult } from '@tazama-lf/frms-coe-lib/lib/interfaces';
export type RuleExecutorConfig = ManagerConfig & Required<Pick<ManagerConfig, 'rawHistory' | 'eventHistory' | 'configuration' | 'localCacheConfig'>>;
export declare function handleTransaction(req: RuleRequest, determineOutcome: (value: number, ruleConfig: RuleConfig, ruleResult: RuleResult) => RuleResult, ruleRes: RuleResult, loggerService: LoggerService, ruleConfig: RuleConfig, databaseManager: DatabaseManagerInstance<RuleExecutorConfig>): Promise<RuleResult>;

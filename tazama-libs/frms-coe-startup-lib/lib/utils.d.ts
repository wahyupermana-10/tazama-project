import type { ILoggerService, IStartupConfig } from './interfaces';
export declare const getLogger: (config: IStartupConfig, loggerService?: ILoggerService) => ILoggerService | Console;

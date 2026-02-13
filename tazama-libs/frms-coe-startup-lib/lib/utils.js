"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = void 0;
const getLogger = (config, loggerService) => {
    if (loggerService) {
        return config.env === 'dev' || config.env === 'test' ? console : loggerService;
    }
    else {
        return console;
    }
};
exports.getLogger = getLogger;
//# sourceMappingURL=utils.js.map
/**
 * ベンチマーク
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const debugLog = debug('SSKTS ');
// tslint:disable-next-line:variable-name
exports.default = (req, _res, next) => {
    if (process.env.NODE_ENV === 'dev') {
        const startMemory = process.memoryUsage();
        const startTime = process.hrtime();
        req.on('end', () => {
            const endMemory = process.memoryUsage();
            const memoryUsage = endMemory.rss - startMemory.rss;
            const diff = process.hrtime(startTime);
            debugLog(
            // tslint:disable-next-line:max-line-length
            `benchmark took ${diff[0]} seconds and ${diff[1]} nanoseconds. memoryUsage:${memoryUsage} (${startMemory.rss} - ${endMemory.rss})`);
        });
    }
    next();
};

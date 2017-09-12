/**
 * ベンチマーク
 */
"use strict";
const debug = require("debug");
const UtilModule = require("../modules/Util/UtilModule");
const log = debug('SSKTS:benchmark');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (req, _, next) => {
    if (process.env.NODE_ENV === UtilModule.ENV.Development) {
        const startMemory = process.memoryUsage();
        const startTime = process.hrtime();
        req.on('end', () => {
            const endMemory = process.memoryUsage();
            const memoryUsage = endMemory.rss - startMemory.rss;
            const diff = process.hrtime(startTime);
            const memory = `${startMemory.rss} - ${endMemory.rss}`;
            log(`benchmark took ${diff[0]} seconds and ${diff[1]} nanoseconds. memoryUsage:${memoryUsage} (${memory})`);
        });
    }
    next();
};

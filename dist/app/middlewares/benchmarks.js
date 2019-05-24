"use strict";
/**
 * ベンチマーク
 */
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const functions_1 = require("../functions");
const log = debug('SSKTS:benchmark');
exports.default = (req, _, next) => {
    if (process.env.NODE_ENV === functions_1.Env.Development) {
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

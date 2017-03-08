/**
 * ベンチマーク
 */

import * as debug from 'debug';
import * as express from 'express';
const debugLog = debug('SSKTS ');

// tslint:disable-next-line:variable-name
export default (req: express.Request, _res: express.Response, next: express.NextFunction) => {

    if (process.env.NODE_ENV === 'dev') {
        const startMemory = process.memoryUsage();
        const startTime = process.hrtime();

        req.on('end', () => {
            const endMemory = process.memoryUsage();
            const memoryUsage = endMemory.rss - startMemory.rss;
            const diff = process.hrtime(startTime);
            debugLog(
                // tslint:disable-next-line:max-line-length
                `benchmark took ${diff[0]} seconds and ${diff[1]} nanoseconds. memoryUsage:${memoryUsage} (${startMemory.rss} - ${endMemory.rss})`
            );
        });
    }

    next();
};

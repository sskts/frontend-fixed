"use strict";
const log4js = require('log4js');
let env = process.env.NODE_ENV || 'dev';
let fs = require('fs-extra');
let logDir = `${__dirname}/../../../logs/${env}/frontend`;
fs.mkdirsSync(logDir);
log4js.configure({
    appenders: [
        {
            category: 'access',
            type: 'console',
            filename: `${logDir}/access.log`,
            pattern: '-yyyy-MM-dd',
        },
        {
            category: 'system',
            type: 'console',
            filename: `${logDir}/system.log`,
            pattern: '-yyyy-MM-dd',
        }
    ],
    levels: {
        access: log4js.levels.ALL.toString(),
        system: (env === 'prod') ? log4js.levels.INFO.toString() : log4js.levels.ALL.toString()
    },
    replaceConsole: (env === 'prod') ? false : false
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = log4js.connectLogger(log4js.getLogger('access'), {});

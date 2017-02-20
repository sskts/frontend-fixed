/**
 * ロガー
 */

import * as fs from 'fs-extra';
import * as log4js from 'log4js';

const env = process.env.NODE_ENV || 'dev';

// ディレクトリなければ作成(初回アクセス時だけ)
const logDir = `${__dirname}/../../../logs/${env}/frontend`;
fs.mkdirsSync(logDir);

log4js.configure({
    appenders: [
        {
            category: 'access', // アクセスログ
            type: 'console',
            filename: `${logDir}/access.log`,
            pattern: '-yyyy-MM-dd'
        },
        {
            category: 'system', // その他のアプリログ(DEBUG、INFO、ERRORなど)
            type: 'console',
            filename: `${logDir}/system.log`,
            pattern: '-yyyy-MM-dd'
        }
    ],
    levels: {
        access: log4js.levels.ALL.toString(),
        system: (env === 'prod') ? log4js.levels.INFO.toString() : log4js.levels.ALL.toString()
    },
    replaceConsole: (env === 'prod') ? false : false
});

export default log4js.connectLogger(log4js.getLogger('access'), {});

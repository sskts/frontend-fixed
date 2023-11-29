/**
 * セッション
 */

import * as connectRedis from 'connect-redis';
import * as createDebug from 'debug';
import * as session from 'express-session';
import * as redis from 'redis';

const debug = createDebug('sskts-frontend:session');

const redisClient = redis.createClient({
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_KEY,
    tls:
        process.env.REDIS_TLS_SERVERNAME === undefined ||
        process.env.REDIS_TLS_SERVERNAME === ''
            ? undefined
            : {
                  servername: process.env.REDIS_TLS_SERVERNAME,
              },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return_buffers: true,
});

debug('redis host...', process.env.REDIS_HOST);

const sessionStore = new (connectRedis(session))({ client: redisClient });

export default session({
    secret: 'FrontendSecret',
    resave: false,
    rolling: true,
    proxy: true,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge:
            process.env.SESSION_COOKIE_MAX_AGE === undefined ||
            process.env.SESSION_COOKIE_MAX_AGE === ''
                ? 1800000
                : Number(process.env.SESSION_COOKIE_MAX_AGE),
    },
});

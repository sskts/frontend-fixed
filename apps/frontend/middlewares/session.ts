/**
 * セッション
 */

import * as connectRedis from 'connect-redis';
import * as session from 'express-session';

// tslint:disable-next-line:no-var-requires no-require-imports
const redis = require('redis');
const redisClient = redis.createClient(
    Number(process.env.REDIS_PORT),
    process.env.REDIS_HOST,
    {
        password: process.env.REDIS_KEY,
        tls: {
            servername: process.env.REDIS_HOST
        },
        return_buffers: true
    }
);

const maxAge = 3600000; //60 * 60 * 1000
const secure = (process.env.NODE_ENV === 'dev') ? false : true;
export default session({
    secret: 'FrontendSecret',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    store: new (connectRedis(session))({
        client: redisClient
    }),
    cookie: {
        secure: secure,
        httpOnly: true,
        maxAge: maxAge
    }
});

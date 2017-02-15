"use strict";
const connectRedis = require("connect-redis");
const session = require("express-session");
// tslint:disable-next-line:no-var-requires no-require-imports
const redis = require('redis');
/**
 * セッション
 */
const redisClient = redis.createClient(Number(process.env.REDIS_PORT), process.env.REDIS_HOST, {
    password: process.env.REDIS_KEY,
    tls: {
        servername: process.env.REDIS_HOST
    },
    return_buffers: true
});
const RedisStore = connectRedis(session);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = session({
    secret: 'FrontendSecret',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    store: new RedisStore({
        client: redisClient
    }),
    cookie: {
        // secure: true,
        httpOnly: true,
        // tslint:disable-next-line:no-magic-numbers
        maxAge: 60 * 60 * 1000
    }
});

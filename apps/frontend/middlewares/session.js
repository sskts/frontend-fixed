/**
 * セッション
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connectRedis = require("connect-redis");
const session = require("express-session");
// tslint:disable-next-line:no-var-requires no-require-imports
const redis = require('redis');
const redisClient = redis.createClient(Number(process.env.REDIS_PORT), process.env.REDIS_HOST, {
    password: process.env.REDIS_KEY,
    tls: {
        servername: process.env.REDIS_HOST
    },
    return_buffers: true
});
const maxAge = 3600000; //60 * 60 * 1000
exports.default = session({
    secret: 'FrontendSecret',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    store: new (connectRedis(session))({
        client: redisClient
    }),
    cookie: {
        httpOnly: true,
        maxAge: maxAge
    }
});

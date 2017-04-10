/**
 * セッション
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connectRedis = require("connect-redis");
const session = require("express-session");
const redis = require("redis");
const redisClient = redis.createClient(Number(process.env.REDIS_PORT), process.env.REDIS_HOST, {
    password: process.env.REDIS_KEY,
    tls: {
        servername: process.env.REDIS_HOST
    },
    return_buffers: true
});
exports.default = session({
    secret: 'FrontendSecret',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    store: new (connectRedis(session))({
        client: redisClient
    }),
    cookie: {
        // secure: (process.env.NoDE_ENV !== 'development') ? true : false,
        httpOnly: true,
        maxAge: 900000 //30 * 60 * 1000
    }
});

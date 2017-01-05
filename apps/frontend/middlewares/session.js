"use strict";
const session = require('express-session');
const config = require('config');
const connectRedis = require('connect-redis');
// import redis = require('redis');
const redis = require('redis');
let redisClient = redis.createClient(config.get('redis_port'), config.get('redis_host'), {
    password: config.get('redis_key'),
    tls: {
        servername: config.get('redis_host')
    },
    return_buffers: true
});
let RedisStore = connectRedis(session);
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
        maxAge: 60 * 60 * 1000
    }
});

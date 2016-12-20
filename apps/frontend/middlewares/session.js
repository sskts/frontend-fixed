"use strict";
const session = require('express-session');
//import redis = require('redis');
const redis = require('redis');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = session({
    secret: 'FrontendSecret',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    // store: new RedisStore({
    //     client: redisClient
    // }),
    cookie: {
        // secure: true,
        httpOnly: true,
        maxAge: 60 * 60 * 1000
    }
});

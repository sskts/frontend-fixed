"use strict";
const session = require('express-session');
let RedisStore = require('connect-redis')(session);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = session({
    secret: 'FrontendSecret',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    // store: new RedisStore({
    //     host: conf.get('redis_host'),
    //     port: conf.get('redis_port'),
    //     pass: conf.get('redis_key')
    // }),
    cookie: {
        // secure: true,
        httpOnly: true,
        maxAge: 60 * 60 * 1000
    }
});

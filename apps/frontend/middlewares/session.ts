import session = require('express-session');
import config = require('config');

let RedisStore = require('connect-redis')(session);

export default session({
    secret: 'FrontendSecret', 
    resave: false,
    rolling: true,
    saveUninitialized: false,
    // store: new RedisStore({
    //     host: config.get('redis_host'),
    //     port: config.get('redis_port'),
    //     pass: config.get('redis_key')
    // }),
    cookie: {
        // secure: true,
        httpOnly: true,
        maxAge: 60 * 60 * 1000
    }
});

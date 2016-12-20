import session = require('express-session');
import config = require('config');
import connectRedis = require('connect-redis');
//import redis = require('redis');
const redis = require('redis');

// let redisClient = redis.createClient(
//     config.get<number>('redis_port'),
//     config.get<string>('redis_host'),
//     {
//         password: config.get<string>('redis_key'),
//         tls: {
//             servername: config.get<string>('redis_host')
//         },
//         return_buffers: true
//     }
// );

// let RedisStore = connectRedis(session);

export default session({
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

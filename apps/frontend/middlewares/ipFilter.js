"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const http_status_1 = require("http-status");
const requestIp = require("request-ip");
const debug = createDebug('sskts-frontend:middlewares:ipFilter');
/**
 * IP制限ミドルウェア
 */
exports.default = (req, res, next) => {
    const clientIp = requestIp.getClientIp(req);
    debug('clientIp is', clientIp);
    // IP制限拒否の場合
    if (clientIp !== '124.155.113.9') {
        res.status(http_status_1.FORBIDDEN).type('text').send('Forbidden');
        return;
    }
    next();
};

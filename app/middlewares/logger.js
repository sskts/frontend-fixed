"use strict";
/**
 * ロガー
 *
 * @module
 */
const winston = require("winston");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: true,
            level: 'error'
        })
    ]
});

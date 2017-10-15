"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * crossDomain
 */
const cors = require("cors");
const corsOptions = {
    origin: process.env.APP_SITE_URL
};
exports.crossDomain = cors(corsOptions);

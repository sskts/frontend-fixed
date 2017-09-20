"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = require("http-status");
exports.default = (__, res, next) => {
    // メンテナンステキストの環境変数設定なければスルー
    if (process.env.SSKTS_MAINTENANCE_TEXT === undefined) {
        next();
        return;
    }
    res.status(http_status_1.GONE).render('maintenance');
    // 環境変数に日本語セットすると文字化ける
    // res.status(GONE).send(process.env.SSKTS_MAINTENANCE_TEXT);
};

/**
 * メンテナンスページミドルウェア
 *
 * @module maintenanceMiddleware
 */
import { NextFunction, Request, Response } from 'express';
import { GONE } from 'http-status';

export default (__: Request, res: Response, next: NextFunction) => {
    // メンテナンステキストの環境変数設定なければスルー
    if (process.env.SSKTS_MAINTENANCE_TEXT === undefined) {
        next();
        return;
    }

    res.status(GONE).render('maintenance');
    // 環境変数に日本語セットすると文字化ける
    // res.status(GONE).send(process.env.SSKTS_MAINTENANCE_TEXT);
};

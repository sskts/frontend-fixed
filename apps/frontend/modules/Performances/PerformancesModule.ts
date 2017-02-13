
import express = require('express');
import request = require('request');
import config = require('config');


namespace PerformancesModule {
    /**
     * パフォーマンス一覧表示
     */
    export function index(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (!req.session) return next(req.__('common.error.property'));
        return res.render('performance');
    }

    /**
     * パフォーマンスリスト取得
     */
    export function getPerformances(req: express.Request, res: express.Response): void {
        const endpoint: string = config.get<string>('mp_api_endpoint');
        const method: string = 'performances';

        const options: request.Options = {
            url: `${endpoint}/${method}/?day=${req.body.day}`,
            method: 'GET',
            json: true
        };

        request.get(options, (error, response, body) => {

            res.json({
                error: error,
                response: response,
                result: body
            });
        });
    }
}

export default PerformancesModule;

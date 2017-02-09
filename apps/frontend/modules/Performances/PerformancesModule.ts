import express = require('express');
import request = require('request');
import config = require('config');


export namespace Module {
    /**
     * パフォーマンス一覧表示
     */
    export function index(req: express.Request, res: express.Response, next: express.NextFunction): void {
        //TODO Session削除
        if (!req.session) return next(req.__('common.error.property'));
                
        return res.render('performance');
    }

    /**
     * パフォーマンスリスト取得
     */
    export function getPerformances(req: express.Request, res: express.Response): void {
        let endpoint: string = config.get<string>('mp_api_endpoint');
        let method: string = 'performances';

        let options: request.Options = {
            url: `${endpoint}/${method}/?day=${req.body.day}`,
            method: 'GET',
            json: true,
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
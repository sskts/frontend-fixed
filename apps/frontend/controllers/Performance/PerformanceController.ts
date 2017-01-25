import BaseController from '../BaseController';
import request = require('request');
import config = require('config');




export default class PerformanceController extends BaseController {


    /**
     * 購入者情報入力完了
     */
    public index(): void {
        //TODO Session削除
        if (!this.req.session) return;
                
        this.res.render('performance');
    }

    /**
     * パフォーマンスリスト取得
     */
    public getPerformances(day: string): void {
        let endpoint: string = config.get<string>('mp_api_endpoint');
        let method: string = 'performances';

        let options: request.Options = {
            url: `${endpoint}/${method}/?day=${day}`,
            method: 'GET',
            json: true,
        };

        request.get(options, (error, response, body) => {
            
            this.res.json({
                error: error,
                response: response,
                result: body
            });
        });
    }

}

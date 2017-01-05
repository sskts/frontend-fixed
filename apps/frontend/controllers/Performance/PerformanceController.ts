import BaseController from '../BaseController';
import request = require('request');
import config = require('config');
import moment = require('moment');

interface name {
    'en': string,
    'ja': string
}

interface performance {
    '__v': number,
    '_id': string,
    'created_at': Date,
    'day': string,
    'film': {
        '_id': string,
        'minutes': number,
        'name': name
    },
    'screen': string,
    'screen_name': name,
    'theater': string,
    'theater_name': name,
    'time_end': string,
    'time_start': string,
    'updated_at': Date
}

export default class PerformanceController extends BaseController {


    /**
     * 購入者情報入力完了
     */
    public index(): void {
        let day: string = moment().format('YYYYMMDD');
        this.getPerformances(day, (performances: performance[]) => {
            let result: any = [];
            let count = 0;
            for (let performance of performances) {
                if (result.length > 0) {
                    if (result[count].film.name.ja === performance.film.name.ja
                    && result[count].theater === performance.theater
                    && result[count].screen === performance.screen) {
                        result[count].performances.push(performance);
                    } else {
                        result.push({
                            theater: performance.theater,
                            theater_name: performance.theater_name,
                            screen: performance.screen,
                            screen_name: performance.screen_name,
                            film: performance.film,
                            performances: [performance]
                        });
                        count++;
                    }
                } else {
                    result.push({
                        theater: performance.theater,
                        theater_name: performance.theater_name,
                        screen: performance.screen,
                        screen_name: performance.screen_name,
                        film: performance.film,
                        performances: [performance]
                    });
                }
            }
            this.res.locals['performances'] = result;
            this.res.render('performance');
        });
    }

    /**
     * パフォーマンスリスト取得
     */
    private getPerformances(day: string, cb: Function): void {
        let endpoint: string = config.get<string>('mp_api_endpoint');
        let method: string = 'performances';

        let options: request.Options = {
            url: `${endpoint}/${method}/?day=${day}`,
            method: 'GET',
            json: true,
        };

        request.get(options, (error, response, body) => {
            if (error) {
                return this.next(new Error('サーバーエラー'));
            }
            if (!body.success) {
                return this.next(new Error('サーバーエラー'));
            }
            cb(body.performances);
        });
    }

}

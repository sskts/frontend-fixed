"use strict";
const BaseController_1 = require("../BaseController");
const request = require("request");
const config = require("config");
const moment = require("moment");
class PerformanceController extends BaseController_1.default {
    /**
     * 購入者情報入力完了
     */
    index() {
        let day = moment().format('YYYYMMDD');
        day = '20170101';
        this.getPerformances(day, (performances) => {
            let result = [];
            let count = 0;
            for (let performance of performances) {
                if (result.length > 0) {
                    if (result[count].film.name.ja === performance.film.name.ja
                        && result[count].theater === performance.theater
                        && result[count].screen === performance.screen) {
                        result[count].performances.push(performance);
                    }
                    else {
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
                }
                else {
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
    getPerformances(day, cb) {
        let endpoint = config.get('endpoint');
        let method = 'performances';
        let options = {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PerformanceController;

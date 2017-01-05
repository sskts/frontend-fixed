"use strict";
const PurchaseController_1 = require('./PurchaseController');
const TicketForm_1 = require('../../forms/Purchase/TicketForm');
const COA = require("../../../../lib/coa/coa");
class TicketTypeSelectController extends PurchaseController_1.default {
    /**
     * 券種選択
     */
    index() {
        if (this.checkSession('performance')
            && this.checkSession('purchaseSeats')) {
            console.log(this.req.session['purchaseSeats']);
            //コアAPI券種取得
            let performance = this.req.session['performance'];
            let args = {
                /** 施設コード */
                theater_code: performance.theater,
                /** 上映日 */
                date_jouei: performance.day,
                /** 作品コード */
                title_code: performance.film,
                /** 作品枝番 */
                title_branch_num: performance.film_branch_code,
                /** 上映時刻 */
                time_begin: performance.time_start,
            };
            COA.salesTicketInterface.call(args, (err, result) => {
            });
            this.res.locals['tickets'] = [
                {
                    ticket_code: 'チケットコード',
                    /** チケット名 */
                    ticket_name: 'チケット名',
                    /** チケット名（カナ） */
                    ticket_name_kana: 'チケット名（カナ）',
                    /** チケット名（英） */
                    ticket_name_eng: 'チケット名（英）',
                    /** 標準単価 */
                    std_price: 1000,
                    /** 加算単価(３Ｄ，ＩＭＡＸ、４ＤＸ等の加算料金) */
                    add_price: 1000,
                    /** 販売単価(標準単価＋加算単価) */
                    sale_price: 1000,
                    /** 人数制限(制限が無い場合は１) */
                    limit_count: 1000,
                    /** 制限単位(１：ｎ人単位、２：ｎ人以上) */
                    limit_unit: '1',
                    /** チケット備考(注意事項等) */
                    ticket_note: 'チケット備考(注意事項等)',
                },
                {
                    ticket_code: 'チケットコード',
                    /** チケット名 */
                    ticket_name: 'チケット名',
                    /** チケット名（カナ） */
                    ticket_name_kana: 'チケット名（カナ）',
                    /** チケット名（英） */
                    ticket_name_eng: 'チケット名（英）',
                    /** 標準単価 */
                    std_price: 1000,
                    /** 加算単価(３Ｄ，ＩＭＡＸ、４ＤＸ等の加算料金) */
                    add_price: 1000,
                    /** 販売単価(標準単価＋加算単価) */
                    sale_price: 1000,
                    /** 人数制限(制限が無い場合は１) */
                    limit_count: 1000,
                    /** 制限単位(１：ｎ人単位、２：ｎ人以上) */
                    limit_unit: '1',
                    /** チケット備考(注意事項等) */
                    ticket_note: 'チケット備考(注意事項等)',
                }
            ];
            this.res.locals['seats'] = this.req.session['purchaseSeats'];
            this.res.locals['step'] = 1;
            //券種選択表示
            this.res.render('purchase/ticket');
        }
        else {
            return this.next(new Error('無効なアクセスです'));
        }
    }
    /**
     * 券種決定
     */
    select() {
        //バリデーション
        console.log(this.req.body.seat_codes);
        TicketForm_1.default(this.req, this.res, () => {
            let seats = JSON.parse(this.req.body.seat_codes);
            //モーションAPI仮抑え
            //座席情報をセッションへ
            this.req.session['purchaseSeats'] = seats;
            this.logger.debug('購入者情報入力完了', this.req.session['purchaseSeats']);
            if (this.req.body['mvtk']) {
                //購入者情報入力へ
                this.res.redirect(this.router.build('purchase.mvtk', {}));
            }
            else {
                //購入者情報入力へ
                this.res.redirect(this.router.build('purchase.input', {}));
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TicketTypeSelectController;

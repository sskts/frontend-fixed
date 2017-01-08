import config = require('config');
import PurchaseController from './PurchaseController';
import InputForm from '../../forms/Purchase/InputForm';
import COA = require("@motionpicture/coa-service");

export default class EnterPurchaseController extends PurchaseController {
    /**
     * 購入者情報入力
     */
    public index(): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        if (this.req.session['performance']
            && this.req.session['reserveSeats']
            && this.req.session['reserveTickets']) {

            //購入者情報入力表示
            this.res.locals['error'] = null;
            this.res.locals['info'] = null;
            this.res.locals['moment'] = require('moment');
            this.res.locals['step'] = 2;
            this.res.locals['gmoModuleUrl'] = config.get<string>('gmo_module_url');
            this.res.locals['gmoShopId'] = config.get<string>('gmo_shop_id');

            if (process.env.NODE_ENV === 'dev') {
                this.res.locals['info'] = {
                    last_name_kanji: '畑口',
                    first_name_kanji: '晃人',
                    last_name_hira: 'はたぐち',
                    first_name_hira: 'あきと',
                    mail: 'hataguchi@motionpicture.jp',
                    mail_confirm: 'hataguchi@motionpicture.jp',
                    tel: '09040007648'
                }
            }

            this.res.render('purchase/input');
        } else {
            return this.next(new Error('無効なアクセスです'));
        }
    }

    /**
     * 購入者情報入力完了
     */
    public submit(): void {

        //モーションAPI

        //バリデーション
        InputForm(this.req, this.res, () => {
            if (!this.req.session) return this.next(new Error('session is undefined'));
            if (!this.req.form) return this.next(new Error('form is undefined'));
            if (this.req.form.isValid) {
                //入力情報をセッションへ
                this.req.session['purchaseInfo'] = {
                    last_name_kanji: this.req.body.last_name_kanji,
                    first_name_kanji: this.req.body.first_name_kanji,
                    last_name_hira: this.req.body.last_name_hira,
                    first_name_hira: this.req.body.first_name_hira,
                    mail: this.req.body.mail,
                    tel: this.req.body.tel,
                };
                //決済情報をセッションへ
                this.req.session['gmoTokenObject'] = JSON.parse(this.req.body.gmo_token_object);
                

                this.updateReserve(()=>{
                    if (!this.router) return this.next(new Error('router is undefined'));
                    //購入者内容確認へ
                    this.res.redirect(this.router.build('purchase.confirm', {}));
                });
                
            } else {
                this.res.locals['error'] = this.req.form.getErrors();
                this.res.locals['info'] = this.req.body;
                this.res.locals['moment'] = require('moment');
                this.res.locals['step'] = 2;
                this.res.locals['gmoModuleUrl'] = config.get<string>('gmo_module_url');
                this.res.locals['gmoShopId'] = config.get<string>('gmo_shop_id');
                this.res.render('purchase/enterPurchase');
            }


        });
    }

    /**
     * 座席本予約
     */
    private updateReserve(cb: Function): void {
        if (!this.req.session) return this.next(new Error('session is undefined'));
        let performance = this.req.session['performance'];
        let reserveSeats = this.req.session['reserveSeats'];
        let purchaseInfo = this.req.session['purchaseInfo'];
        let reserveTickets = this.req.session['reserveTickets'];
        let tickets: any[] = [];
        let price = 0;
        reserveTickets.forEach((value: any, key: string) => {
            tickets.push({
                /** チケットコード */
                ticket_code: value.ticket_code,
                /** 標準単価 */
                std_price: value.std_price,
                /** 加算単価 */
                add_price: value.add_price,
                /** 割引額 */
                dis_price: value.dis_price,
                /** 金額 */
                sale_price: value.sale_price,
                /** 枚数 */
                ticket_count: value.ticket_count,
                /** 座席番号 */
                seat_num: key,
            });
            price += value.sale_price;
        });
        let args: COA.updateReserveInterface.Args = {
            /** 施設コード */
            theater_code: performance.theater._id,
            /** 上映日 */
            date_jouei: performance.day,
            /** 作品コード */
            title_code: performance.film.coa_title_code,
            /** 作品枝番 */
            title_branch_num: performance.film.coa_title_branch_num,
            /** 上映時刻 */
            time_begin: performance.time_start,
            /** 座席チケット仮予約番号 */
            tmp_reserve_num: reserveSeats.tmp_reserve_num,
            /** 予約者名 */
            reserve_name: purchaseInfo.last_name_kanji + purchaseInfo.first_name_kanji,
            /** 予約者名（かな） */
            reserve_name_kana: purchaseInfo.last_name_hira + purchaseInfo.first_name_hira,
            /** 電話番号 */
            tel_num: purchaseInfo.tel,
            /** メールアドレス */
            mail_addr: purchaseInfo.mail,
            /** 予約金額 */
            reserve_amount: price,
            /** 価格情報リスト */
            list_ticket: tickets,
        };
        COA.updateReserveInterface.call(args, (err, result) => {
            if (err) return this.next(new Error(err.message));
            if (!this.req.session) return this.next(new Error('session is undefined'));
            //予約情報をセッションへ
            this.req.session['updateReserve'] = result;
            this.logger.debug('本予約完了', this.req.session['updateReserve']);
            cb();
        });
    }


}

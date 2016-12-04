"use strict";
const PurchaseController_1 = require('./PurchaseController');
class SeatSelectController extends PurchaseController_1.default {
    /**
     * 座席選択
     */
    index() {
        let token = '123456789';
        this.res.locals.token = token;
        //トークンをセッションへ
        this.req.session['purchaseToken'] = token;
        //コアAPIから作品データ取得
        let film = {
            theater: 'シネマサンシャイン池袋',
            screen: 'スクリーン1',
            name: '君の名は',
            schedule: '201612031500'
        };
        //作品情報をセッションへ
        this.req.session['purchaseFilm'] = film;
        //座席選択表示
        this.res.render('purchase/seatSelect');
    }
    /**
     * 座席決定
     */
    seatSelect() {
        this.checkToken();
        let seats = ['A-1', 'A-2', 'A-3'];
        //モーションAPI仮抑え
        //座席情報をセッションへ
        this.req.session['purchaseFilm']['seats'] = seats;
        //券種選択へ
        this.res.redirect(this.router.build('purchase.ticketTypeSelect', {}));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SeatSelectController;

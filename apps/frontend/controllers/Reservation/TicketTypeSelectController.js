"use strict";
const ReservationController_1 = require('./ReservationController');
class TicketTypeSelectController extends ReservationController_1.default {
    /**
     * 券種選択
     */
    index() {
        this.logger.debug('session', this.req.session);
        this.res.locals['token'] = this.req.session['reservationToken'];
        //コアAPI券種取得
        //券種選択表示
        this.res.render('reservation/ticketTypeSelect');
    }
    /**
     * 券種決定
     */
    denominationSelect() {
        this.checkToken();
        let tickets = [
            { type: '一般', length: 2 },
            { type: '学生', length: 1 }
        ];
        //券種情報をセッションへ
        this.req.session['reservationFilm']['tickets'] = tickets;
        //購入者情報入力へ
        this.res.redirect(this.router.build('reservation.enterPurchaser', {}));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TicketTypeSelectController;

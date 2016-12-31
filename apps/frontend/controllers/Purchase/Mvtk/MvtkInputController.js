"use strict";
const MvtkController_1 = require("./MvtkController");
class MvtkInputController extends MvtkController_1.default {
    /**
     * ムビチケ券入力ページ表示
     */
    index() {
        if (this.checkSession('reservationNo')
            && this.checkSession('performance')
            && this.checkSession('purchaseSeats')) {
            this.logger.debug('ムビチケ券入力ページ表示', this.req.session['reservationNo']);
            //購入者情報入力表示
            this.res.locals['reservationNo'] = this.req.session['reservationNo'];
            this.res.locals['error'] = null;
            this.res.locals['step'] = 2;
            this.res.render('purchase/mvtk/input');
        }
        else {
            return this.next(new Error('無効なアクセスです'));
        }
    }
    /**
     * 認証
     */
    auth() {
        this.res.redirect(this.router.build('purchase.mvtk.confirm', {}));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MvtkInputController;

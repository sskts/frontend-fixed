"use strict";
const MvtkController_1 = require('./MvtkController');
class MvtkConfirmController extends MvtkController_1.default {
    /**
     * ムビチケ券適用確認ページ表示
     */
    index() {
        if (this.checkSession('performance')
            && this.checkSession('purchaseSeats')) {
            //購入者情報入力表示
            this.res.locals['error'] = null;
            this.res.locals['step'] = 2;
            this.res.render('purchase/mvtk/confirm');
        }
        else {
            return this.next(new Error('無効なアクセスです'));
        }
    }
    /**
     * 購入者情報入力へ
     */
    submit() {
        this.res.redirect(this.router.build('purchase.input', {}));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MvtkConfirmController;
